"""Managed services shown on the dedicated /services page and homepage."""
import uuid

from django.db import models

from siteconfig.models import MediaAsset


class Service(models.Model):
    """A clinic service: shown fully on /services and as a card on the homepage."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField("نام خدمت", max_length=120)
    short_desc = models.CharField("توضیح کوتاه (کارت خانه)", max_length=200, blank=True)
    description = models.TextField("توضیح کامل", blank=True)
    image = models.ForeignKey(
        MediaAsset, verbose_name="تصویر", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="services",
        help_text="از کتابخانه رسانه انتخاب می‌شود؛ خالی = آیکون پیش‌فرض",
    )
    # Optional external image URL (e.g. Cloudinary) as an alternative to the library.
    image_url = models.URLField("آدرس تصویر (اختیاری)", max_length=500, blank=True)
    # Icon name from the lucide set rendered by the frontend.
    icon = models.CharField("نام آیکون", max_length=40, blank=True, default="Sparkles")
    order = models.PositiveIntegerField("ترتیب نمایش", default=0)
    is_active = models.BooleanField("فعال", default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "خدمت"
        verbose_name_plural = "خدمات"
        ordering = ["order", "created_at"]

    def __str__(self):
        return self.name

    @property
    def resolved_image(self) -> str:
        """Library image wins over the external URL; '' means no image."""
        if self.image_id and self.image:
            try:
                return self.image.file.url
            except ValueError:
                pass
        return self.image_url or ""
