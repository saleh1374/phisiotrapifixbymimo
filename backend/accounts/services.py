"""Business logic for OTP generation, SMS delivery and verification."""
import logging
import secrets

from django.conf import settings
from django.utils import timezone

from .models import OTP, User

logger = logging.getLogger(__name__)


def verify_google_token(id_token: str) -> dict:
    """Verify a Google ID token using the google-auth library.

    Uses local JWKS verification instead of the external tokeninfo endpoint.
    Raises ValueError on any failure.
    """
    from google.oauth2 import id_token as google_id_token
    from google.auth.transport import requests as google_requests

    client_id = getattr(settings, "GOOGLE_CLIENT_ID", "")
    if not client_id:
        raise ValueError("ورود با گوگل هنوز پیکربندی نشده است")

    try:
        payload = google_id_token.verify_oauth2_token(
            id_token, google_requests.Request(), client_id
        )
    except Exception:
        raise ValueError("توکن گوگل نامعتبر یا منقضی شده است")

    if not payload.get("email"):
        raise ValueError("حساب گوگل شما آدرس ایمیل ندارد")
    return payload


def username_from_email(email: str) -> str:
    """Derive a unique username from a Google email address."""
    import re

    base = re.sub(r"[^a-zA-Z0-9_]", "", email.split("@")[0]) or "user"
    base = base[:28]
    candidate = base
    suffix = 1
    while User.objects.filter(username__iexact=candidate).exists():
        suffix += 1
        candidate = f"{base[:28 - len(str(suffix))]}{suffix}"
    return candidate


def normalize_phone(phone_number: str) -> str:
    """Normalize an Iranian phone number to the canonical 09xxxxxxxxx form."""
    phone = phone_number.replace(" ", "").replace("-", "")
    if phone.startswith("+98"):
        phone = "0" + phone[3:]
    if not (phone.startswith("09") and len(phone) == 11 and phone.isdigit()):
        raise ValueError("شماره موبایل معتبر نیست")
    return phone


def _send_sms(phone_number: str, message: str) -> None:
    """Deliver the OTP through the backend chosen in the admin panel.

    - `console`: print the code to the server log (development default).
    - `email`: send it via the SMTP account configured in the admin panel
      (e.g. a Gmail account with an App Password). Falls back to console
      when the recipient has no email address on file.
    """
    from siteconfig.models import SiteSetting

    site = SiteSetting.get()
    backend = site.otp_backend or getattr(settings, "OTP_SMS_BACKEND", "console")

    if backend == SiteSetting.OTPBackend.EMAIL:
        email = User.objects.filter(phone_number=phone_number).values_list("email", flat=True).first()
        if email:
            try:
                _send_otp_email(site, email, message)
                return
            except Exception as exc:
                logger.warning("OTP email failed (%s); falling back to console.", exc)
        # No email on file or send failure → visible fallback.
        print(f"[SMS → {phone_number}] {message}", flush=True)
        return

    # console (default)
    logger.info("[SMS→%s] %s", phone_number, message)
    # flush=True: with output redirected to a file (docker/dev servers),
    # the buffered code would otherwise never reach the log in time.
    print(f"[SMS → {phone_number}] {message}", flush=True)


def _send_otp_email(site, email: str, message: str) -> None:
    """Send the OTP through the SMTP account saved in site settings."""
    from django.core import mail
    from django.core.mail import get_connection

    if not site.smtp_host or not site.smtp_user or not site.smtp_password:
        raise ValueError("SMTP تنظیم نشده است")

    sender = site.email_from or site.smtp_user

    connection = get_connection(
        backend="django.core.mail.backends.smtp.EmailBackend",
        host=site.smtp_host,
        port=site.smtp_port,
        username=site.smtp_user,
        password=site.smtp_password,
        use_tls=site.smtp_use_tls,
    )

    mail.send_mail(
        subject="کد تایید ورود | " + (site.site_name or "کلینیک"),
        message=message,
        from_email=sender,
        recipient_list=[email],
        connection=connection,
        fail_silently=False,
    )


def request_otp(phone_number: str) -> None:
    """Generate a fresh 6-digit OTP and send it to the given phone number."""
    phone = normalize_phone(phone_number)

    # Invalidate any previous, still-unused codes for this phone.
    OTP.objects.filter(phone_number=phone, is_used=False).update(is_used=True)

    code = f"{secrets.randbelow(1_000_000):06d}"
    otp = OTP.objects.create(
        phone_number=phone,
        code=code,
        expires_at=timezone.now() + timezone.timedelta(seconds=settings.OTP_EXPIRY_SECONDS),
    )
    _send_sms(phone, f"کد ورود شما به کلینیک فیزیوتراپی: {code}")
    return otp.id


def verify_otp(phone_number: str, code: str) -> User:
    """Verify an OTP code. Raises ValueError on any failure.

    Returns the (possibly just-created) user for this phone number.
    """
    phone = normalize_phone(phone_number)
    otp = (
        OTP.objects.filter(phone_number=phone, is_used=False)
        .order_by("-created_at")
        .first()
    )
    if otp is None:
        raise ValueError("کد منقضی شده است؛ لطفاً کد جدیدی درخواست کنید")

    if otp.attempts >= settings.OTP_MAX_ATTEMPTS:
        otp.is_used = True
        otp.save(update_fields=["is_used"])
        raise ValueError("تعداد تلاشهای ناموفق زیاد بود؛ کد جدیدی درخواست کنید")

    if not otp.is_valid_code(code):
        otp.attempts += 1
        otp.save(update_fields=["attempts"])
        raise ValueError("کد وارد شده صحیح نیست")

    otp.is_used = True
    otp.save(update_fields=["is_used"])

    # Register the user on first login (auto sign-up by phone number).
    user, created = User.objects.get_or_create(
        phone_number=phone,
        defaults={"is_active": True},
    )
    # For brand-new accounts, last_login mirrors created_at so the API's
    # `is_new` flag is reliable (it compares the two timestamps).
    user.last_login = user.created_at if created else timezone.now()
    user.save(update_fields=["last_login"])
    return user