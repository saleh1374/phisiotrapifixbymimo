"""Singleton site settings + editable content — the heart of the visual editor."""
import uuid

from django.db import models


class ThemePreset(models.TextChoices):
    """Built-in color palettes the admin can switch between in one click."""

    BLUE = "blue", "آبی (پیش‌فرض)"
    GREEN = "green", "سبز"
    ORANGE = "orange", "نارنجی"
    PURPLE = "purple", "بنفش"
    TEAL = "teal", "فیروزه‌ای"
    ROSE = "rose", "صورتی"
    CUSTOM = "custom", "سفارشی"


class FontFamily(models.TextChoices):
    """Self-hosted Persian-capable fonts bundled with the frontend (19 families)."""

    VAZIRMATN = "Vazirmatn", "وزیرمتن"
    ESTEEDAD = "Estedad", "استعداد"
    NOTO_SANS_ARABIC = "Noto Sans Arabic", "نوتو سنس"
    IBM_PLEX_SANS_ARABIC = "IBM Plex Sans Arabic", "آی‌بی‌ام پلکس"
    CAIRO = "Cairo", "قاهره"
    ALMARAI = "Almarai", "المرعی"
    MADA = "Mada", "مداء"
    CHANGA = "Changa", "چنگا"
    READEX_PRO = "Readex Pro", "ریدکس پرو"
    EL_MESSIRI = "El Messiri", "المسیری"
    RUBIK = "Rubik", "روبیک"
    TAJAWAL = "Tajawal", "تجوال"
    MARKAZI_TEXT = "Markazi Text", "مرکزی"
    AMIRI = "Amiri", "امیری"
    SCHEHERAZADE_NEW = "Scheherazade New", "شهرزاد"
    NOTO_NASKH_ARABIC = "Noto Naskh Arabic", "نسخ نوتو"
    LALEZAR = "Lalezar", "لاله‌زار"
    GULZAR = "Gulzar", "گلزار"
    NOTO_NASTALIQ_URDU = "Noto Nastaliq Urdu", "نستعلیق نوتو"


def _default_theme() -> dict:
    return {
        "preset": "blue",
        "primary": "#2d6a4f",
        "primary_light": "#3f8a68",
        "primary_dark": "#256044",
        "accent": "#d4a373",
        "accent_light": "#e6c39a",
        "navy": "#1b2a4a",
        "navy_light": "#2c3f66",
        "navy_dark": "#131f38",
        "cream": "#faf7f2",
        "heading_font": "Vazirmatn",
        "body_font": "Vazirmatn",
        "heading_weight": "800",
        "radius": "16",
    }


class SiteSetting(models.Model):
    """One row (pk=1) holding every site-level setting."""

    class OTPBackend(models.TextChoices):
        CONSOLE = "console", "چاپ در کنسول (توسعه)"
        EMAIL = "email", "ارسال با ایمیل (SMTP)"

    # Identity
    site_name = models.CharField("نام سایت", max_length=100, default="کلینیک فیزیوتراپی")
    site_tagline = models.CharField(
        "شعار", max_length=200, default="رزرو نوبت، فیلم آموزشی و آکادمی تخصصی"
    )
    site_description = models.TextField("توضیحات سایت", blank=True)
    announcement = models.CharField("اعلان سراسری (بنر بالای سایت)", max_length=300, blank=True)

    # Contact
    contact_phone = models.CharField("تلفن تماس", max_length=30, blank=True, default="۰۲۱-۸۸۷۷۶۶۵۵")
    contact_email = models.EmailField("ایمیل تماس", blank=True, default="info@physioclinic.ir")
    address = models.CharField("آدرس", max_length=200, blank=True, default="تهران، خیابان آزادی، پلاک ۱۲۳")
    working_hours = models.CharField("ساعات کاری", max_length=100, blank=True, default="شنبه تا پنجشنبه ۹ تا ۲۰")

    # ------------------------------------------------------------------
    # Appearance / theme (visual editor)
    # ------------------------------------------------------------------
    theme = models.JSONField("تم", default=_default_theme, blank=True)

    # Branding uploads (visual editor → رسانه)
    logo = models.ImageField(
        "لوگو", upload_to="branding/", blank=True, null=True,
        help_text="لوگوی سایت — به‌جای علامت «ف» نمایش داده می‌شود",
    )
    logo_alt_text = models.CharField("متن جایگزین لوگو", max_length=120, blank=True)
    favicon = models.ImageField(
        "فاوآیکون", upload_to="branding/", blank=True, null=True,
        help_text="آیکون مرورگر — ۳۲×۳۲ یا ۱۸۰×۱۸۰ PNG",
    )
    og_image = models.ImageField(
        "تصویر اشتراک‌گذاری", upload_to="branding/", blank=True, null=True,
        help_text="تصویری که در شبکه‌های اجتماعی هنگام اشتراک لینک نمایش داده می‌شود",
    )

    # OTP delivery (ورود با کد)
    otp_backend = models.CharField(
        "روش ارسال کد تایید",
        max_length=10,
        choices=OTPBackend.choices,
        default=OTPBackend.CONSOLE,
    )

    # SMTP — used when otp_backend == email (e.g. a Gmail account)
    smtp_host = models.CharField("SMTP هاست", max_length=200, blank=True)
    smtp_port = models.PositiveIntegerField("SMTP پورت", default=587)
    smtp_user = models.CharField("SMTP نام کاربری (ایمیل)", max_length=200, blank=True)
    smtp_password = models.CharField("SMTP رمز (App Password)", max_length=200, blank=True)
    smtp_use_tls = models.BooleanField("استفاده از TLS", default=True)
    email_from = models.EmailField("فرستنده (From)", blank=True)

    # Google sign-in
    google_client_id = models.CharField("Google Client ID", max_length=200, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "تنظیمات سایت"
        verbose_name_plural = "تنظیمات سایت"

    def __str__(self):
        return self.site_name

    @classmethod
    def get(cls) -> "SiteSetting":
        """Singleton accessor."""
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def effective_theme(self) -> dict:
        """Theme dict merged over defaults so missing keys never break the UI."""
        theme = dict(_default_theme())
        if isinstance(self.theme, dict):
            for key, value in self.theme.items():
                if key in theme and value not in (None, ""):
                    theme[key] = value
        return theme


def get_site_settings() -> SiteSetting:
    return SiteSetting.get()


class MediaAsset(models.Model):
    """A reusable uploaded image, manageable from the admin panel."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ImageField("فایل", upload_to="assets/")
    title = models.CharField("عنوان", max_length=120, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "رسانه"
        verbose_name_plural = "رسانه‌ها"
        ordering = ["-uploaded_at"]

    def __str__(self):
        return self.title or self.file.name


class SiteContent(models.Model):
    """Editable texts/images of any section, stored as JSON.

    Rows are keyed like ``home.hero`` etc. so the frontend can fetch everything
    in one call and the admin panel can list them per page.
    """

    key = models.CharField("کلید", max_length=100, unique=True, db_index=True)
    data = models.JSONField("محتوا", default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "محتوای قابل ویرایش"
        verbose_name_plural = "محتواهای قابل ویرایش"

    def __str__(self):
        return self.key

    @classmethod
    def get(cls, key: str, defaults: dict | None = None) -> dict:
        """Fetch a content block, creating it from defaults on first access."""
        obj, _ = cls.objects.get_or_create(key=key, defaults={"data": defaults or {}})
        if not obj.data and defaults:
            obj.data = defaults
            obj.save(update_fields=["data"])
        return obj.data
