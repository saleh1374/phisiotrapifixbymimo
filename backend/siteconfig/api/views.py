"""Theme/image/content API — powers the visual editor of the admin panel."""
import uuid

from django.core.files.uploadedfile import UploadedFile
from drf_spectacular.utils import extend_schema
from rest_framework import parsers, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_api.views import _deny, _is_admin
from siteconfig.api.serializers import (
    ContentBlockSerializer,
    MediaAssetSerializer,
    ThemeSerializer,
)
from siteconfig.models import MediaAsset, SiteContent, SiteSetting

# Accept common raster formats; SVG is rejected for security reasons.
IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB
MAX_IMAGE_DIMENSION = 4000


def _validate_image(upload: UploadedFile) -> str | None:
    """Return a Persian error message when the upload is not an acceptable image."""
    if upload.size > MAX_UPLOAD_BYTES:
        return "حجم فایل نباید بیش از ۵ مگابایت باشد"
    content_type = getattr(upload, "content_type", "") or ""
    if content_type not in IMAGE_CONTENT_TYPES:
        return "فقط تصاویر JPG، PNG، WebP، GIF یا AVIF مجاز هستند (SVG به‌دلیل مسائل امنیتی پذیرفته نمی‌شود)"
    try:
        from PIL import Image  # Pillow ships with Django for ImageField

        pos = upload.tell()
        upload.seek(0)
        img = Image.open(upload)
        img.verify()
        upload.seek(pos)
        if max(img.size) > MAX_IMAGE_DIMENSION:
            return "ابعاد تصویر نباید بیش از ۴۰۰۰ پیکسل باشد"
    except ImportError:
        return None  # Pillow missing — content-type check only
    except Exception:
        return "فایل ارسالی یک تصویر معتبر نیست"
    return None


class ThemeView(APIView):
    """Read/write the site theme (colors, fonts, radius)."""

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses=ThemeSerializer)
    def get(self, request):
        if not _is_admin(request.user):
            return _deny()
        return Response(SiteSetting.get().effective_theme())

    def put(self, request):
        if not _is_admin(request.user):
            return _deny()
        setting = SiteSetting.get()
        serializer = ThemeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        setting.theme = serializer.validated_data
        setting.save(update_fields=["theme", "updated_at"])
        return Response(setting.effective_theme())


class PublicThemeView(APIView):
    """Theme for every visitor — no auth. Cheap enough to call on load."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(SiteSetting.get().effective_theme())


class BrandingView(APIView):
    """Upload/delete branding images (logo, favicon, og image)."""

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    FIELDS = {"logo", "favicon", "og_image"}

    def post(self, request):
        if not _is_admin(request.user):
            return _deny()
        setting = SiteSetting.get()
        field = request.data.get("field")
        if field not in self.FIELDS:
            return Response(
                {"detail": "فیلد باید یکی از logo / favicon / og_image باشد"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        upload = request.FILES.get("image")
        if upload is None:
            return Response({"detail": "تصویری ارسال نشده است"}, status=status.HTTP_400_BAD_REQUEST)
        error = _validate_image(upload)
        if error:
            return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)
        setattr(setting, field, upload)
        if "alt_text" in request.data and field == "logo":
            setting.logo_alt_text = str(request.data["alt_text"])[:120]
        setting.save()
        return Response(self._payload(setting))

    def delete(self, request):
        if not _is_admin(request.user):
            return _deny()
        setting = SiteSetting.get()
        field = request.data.get("field")
        if field not in self.FIELDS:
            return Response(
                {"detail": "فیلد باید یکی از logo / favicon / og_image باشد"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        current = getattr(setting, field)
        if current:
            current.delete(save=False)
        setattr(setting, field, None)
        setting.save()
        return Response(self._payload(setting))

    @staticmethod
    def _payload(setting: SiteSetting) -> dict:
        def _url(field: str) -> str:
            f = getattr(setting, field)
            try:
                return f.url if f else ""
            except ValueError:
                return ""

        return {
            "logo": _url("logo"),
            "logo_alt_text": setting.logo_alt_text,
            "favicon": _url("favicon"),
            "og_image": _url("og_image"),
        }


class PublicBrandingView(APIView):
    """Branding URLs for the public site (logo/favicon)."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(BrandingView._payload(SiteSetting.get()))


class MediaLibraryView(APIView):
    """Reusable image library — list, upload, delete."""

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get(self, request):
        if not _is_admin(request.user):
            return _deny()
        assets = MediaAsset.objects.all()
        return Response(MediaAssetSerializer(assets, many=True).data)

    def post(self, request):
        if not _is_admin(request.user):
            return _deny()
        uploads = request.FILES.getlist("images") or ([request.FILES.get("image")] if request.FILES.get("image") else [])
        if not uploads:
            return Response({"detail": "تصویری ارسال نشده است"}, status=status.HTTP_400_BAD_REQUEST)
        created, errors = [], []
        for upload in uploads:
            error = _validate_image(upload)
            if error:
                errors.append(f"{getattr(upload, 'name', 'فایل')}: {error}")
                continue
            title = (request.data.get("title") or getattr(upload, "name", "")).rsplit(".", 1)[0][:120]
            asset = MediaAsset.objects.create(file=upload, title=title)
            created.append(MediaAssetSerializer(asset).data)
        if not created:
            return Response({"detail": "؛ ".join(errors) or "آپلود ناموفق بود"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"created": created, "errors": errors}, status=status.HTTP_201_CREATED)


class MediaAssetDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        if not _is_admin(request.user):
            return _deny()
        asset = MediaAsset.objects.filter(pk=pk).first()
        if asset is None:
            return Response({"detail": "رسانه یافت نشد"}, status=status.HTTP_404_NOT_FOUND)
        asset.file.delete(save=False)
        asset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ContentBlocksView(APIView):
    """List all editable content blocks (admin)."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not _is_admin(request.user):
            return _deny()
        blocks = SiteContent.objects.all().order_by("key")
        return Response(ContentBlockSerializer(blocks, many=True).data)

    def put(self, request):
        """Bulk update: [{"key": ..., "data": {...}}, ...]"""
        if not _is_admin(request.user):
            return _deny()
        items = request.data if isinstance(request.data, list) else None
        if items is None:
            return Response({"detail": "بدنه درخواست باید یک لیست باشد"}, status=status.HTTP_400_BAD_REQUEST)
        updated = []
        for item in items:
            serializer = ContentBlockSerializer(data=item, validate_only=True)
            serializer.is_valid(raise_exception=True)
            key = serializer.validated_data["key"]
            obj, _ = SiteContent.objects.update_or_create(key=key, defaults={"data": serializer.validated_data["data"]})
            updated.append(ContentBlockSerializer(obj).data)
        return Response(updated)


class PublicContentView(APIView):
    """All content blocks for the public site — one call, cached client-side."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        blocks = {b.key: b.data for b in SiteContent.objects.all()}
        return Response(blocks)


class ContentBlockDetailView(APIView):
    """Update a single block by key (admin)."""

    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, key):
        if not _is_admin(request.user):
            return _deny()
        serializer = ContentBlockSerializer(data={"key": key, "data": request.data}, validate_only=True)
        serializer.is_valid(raise_exception=True)
        obj, _ = SiteContent.objects.update_or_create(
            key=serializer.validated_data["key"], defaults={"data": serializer.validated_data["data"]}
        )
        return Response(ContentBlockSerializer(obj).data)

    def delete(self, request, key):
        if not _is_admin(request.user):
            return _deny()
        deleted, _ = SiteContent.objects.filter(key=key).delete()
        if not deleted:
            return Response({"detail": "بلوک یافت نشد"}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
