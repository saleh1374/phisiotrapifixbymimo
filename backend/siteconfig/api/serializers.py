"""Serializers for the visual-editor API (theme, content, media)."""
import re

from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from siteconfig.models import MediaAsset, SiteContent

HEX_RE = re.compile(r"^#[0-9a-fA-F]{6}$")

FONT_CHOICES = [
    "Vazirmatn", "Estedad", "Noto Sans Arabic", "IBM Plex Sans Arabic",
    "Cairo", "Almarai", "Mada", "Changa", "Readex Pro", "El Messiri",
    "Rubik", "Tajawal", "Markazi Text", "Amiri", "Scheherazade New",
    "Noto Naskh Arabic", "Lalezar", "Gulzar", "Noto Nastaliq Urdu",
]
WEIGHTS = ["400", "500", "600", "700", "800", "900"]

THEME_COLOR_FIELDS = {
    "primary": "#2d6a4f",
    "primary_light": "#3f8a68",
    "primary_dark": "#256044",
    "accent": "#d4a373",
    "accent_light": "#e6c39a",
    "navy": "#1b2a4a",
    "navy_light": "#2c3f66",
    "navy_dark": "#131f38",
    "cream": "#faf7f2",
}

PRESETS = ["blue", "green", "orange", "purple", "teal", "rose", "custom"]


class ThemeSerializer(serializers.Serializer):
    """Validates the theme JSON blob; unknown keys are dropped."""

    preset = serializers.ChoiceField(choices=PRESETS, required=False)
    heading_font = serializers.ChoiceField(choices=FONT_CHOICES, required=False)
    body_font = serializers.ChoiceField(choices=FONT_CHOICES, required=False)
    heading_weight = serializers.ChoiceField(choices=WEIGHTS, required=False)
    # 0..40 px corner radius
    radius = serializers.IntegerField(min_value=0, max_value=40, required=False)

    def validate(self, attrs):
        out = dict(attrs)
        for field, default in THEME_COLOR_FIELDS.items():
            raw = self.initial_data.get(field)
            if raw in (None, ""):
                continue
            value = str(raw).strip()
            if not HEX_RE.match(value):
                raise serializers.ValidationError({field: "رنگ باید به فرمت #RRGGBB باشد"})
            out[field] = value.lower()
        return out

    def to_representation(self, instance):
        return dict(instance)


class ContentBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteContent
        fields = ["key", "data", "updated_at"]
        read_only_fields = ["updated_at"]

    def __init__(self, *args, **kwargs):
        # Validation-only mode: skip model uniqueness checks (upsert endpoints
        # decide create-vs-update themselves and always return 200).
        validate_only = kwargs.pop("validate_only", False)
        super().__init__(*args, **kwargs)
        if validate_only:
            self.fields["key"].validators = [
                v for v in self.fields["key"].validators if not isinstance(v, UniqueValidator)
            ]

    def validate_key(self, value: str) -> str:
        value = (value or "").strip().lower()
        if not re.fullmatch(r"[a-z0-9_]+(\.[a-z0-9_]+)*", value or ""):
            raise serializers.ValidationError("کلید فقط می‌تواند شامل حروف کوچک لاتین، عدد، نقطه و آندرلاین باشد")
        return value

    def validate_data(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("محتوا باید یک شیء JSON باشد")
        # Keep values scalar or list-of-scalars — blocks are flat by design.
        for k, v in value.items():
            if isinstance(v, (dict,)):
                raise serializers.ValidationError(f"مقدار «{k}» نمی‌تواند آبجکت باشد")
            if isinstance(v, list) and any(isinstance(x, (dict, list)) for x in v):
                raise serializers.ValidationError(f"مقدار «{k}» باید لیست ساده باشد")
            if isinstance(v, str) and len(v) > 5000:
                raise serializers.ValidationError(f"متن «{k}» بیش از حد بلند است")
        return value


class MediaAssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = ["id", "url", "title", "uploaded_at"]

    def get_url(self, obj: MediaAsset) -> str:
        try:
            return obj.file.url
        except (ValueError, AttributeError):
            return ""
