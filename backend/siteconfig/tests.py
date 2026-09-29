"""Tests for the visual editor API — theme, branding uploads, content blocks, media library."""
import io

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from PIL import Image
from rest_framework.test import APITestCase as TestCase

from accounts.models import User
from siteconfig.models import MediaAsset, SiteContent, SiteSetting


def _admin():
    return User.objects.create_user(username="boss2", password="secret123", role=User.Role.ADMIN)


def _patient():
    return User.objects.create_user(username="patient9", password="secret123")


def _png(name="test.png", color=(200, 30, 30)):
    buf = io.BytesIO()
    Image.new("RGB", (64, 64), color).save(buf, format="PNG")
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/png")


class ThemeApiTests(TestCase):
    def test_public_theme_open(self):
        resp = self.client.get(reverse("public-theme"))
        self.assertEqual(resp.status_code, 200)
        self.assertIn("primary", resp.json())

    def test_theme_requires_admin(self):
        self.client.force_authenticate(_patient())
        resp = self.client.put(reverse("admin-theme"), data={"primary": "#123456"}, format="json")
        self.assertEqual(resp.status_code, 403)

    def test_admin_updates_theme_and_public_sees_it(self):
        self.client.force_authenticate(_admin())
        resp = self.client.put(
            reverse("admin-theme"),
            data={"preset": "orange", "primary": "#ea580c", "heading_font": "Estedad"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.json()["primary"], "#ea580c")

        public = self.client.get(reverse("public-theme")).json()
        self.assertEqual(public["primary"], "#ea580c")
        self.assertEqual(public["heading_font"], "Estedad")
        self.assertEqual(public["preset"], "orange")

    def test_invalid_color_rejected(self):
        self.client.force_authenticate(_admin())
        resp = self.client.put(reverse("admin-theme"), data={"primary": "red"}, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("primary", resp.json())

    def test_invalid_font_rejected(self):
        self.client.force_authenticate(_admin())
        resp = self.client.put(reverse("admin-theme"), data={"body_font": "ComicSans"}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_theme_merge_keeps_defaults(self):
        s = SiteSetting.get()
        s.theme = {"primary": "#0000ff"}
        s.save()
        theme = s.effective_theme()
        self.assertEqual(theme["primary"], "#0000ff")
        self.assertEqual(theme["heading_font"], "Vazirmatn")  # default kept


class BrandingUploadTests(TestCase):
    def test_requires_admin(self):
        self.client.force_authenticate(_patient())
        resp = self.client.post(reverse("admin-branding"), {"field": "logo", "image": _png()})
        self.assertEqual(resp.status_code, 403)

    def test_logo_upload_and_public_visibility(self):
        self.client.force_authenticate(_admin())
        resp = self.client.post(
            reverse("admin-branding"), {"field": "logo", "image": _png(), "alt_text": "لوگوی کلینیک"}, format="multipart"
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertTrue(resp.json()["logo"].startswith("/media/branding/"))

        public = self.client.get(reverse("public-branding")).json()
        self.assertTrue(public["logo"].startswith("/media/branding/"))
        self.assertEqual(public["logo_alt_text"], "لوگوی کلینیک")

    def test_svg_rejected(self):
        self.client.force_authenticate(_admin())
        svg = SimpleUploadedFile("evil.svg", b"<svg onload='x'></svg>", content_type="image/svg+xml")
        resp = self.client.post(reverse("admin-branding"), {"field": "favicon", "image": svg}, format="multipart")
        self.assertEqual(resp.status_code, 400)

    def test_non_image_rejected(self):
        self.client.force_authenticate(_admin())
        fake = SimpleUploadedFile("fake.png", b"not-an-image", content_type="image/png")
        resp = self.client.post(reverse("admin-branding"), {"field": "logo", "image": fake}, format="multipart")
        self.assertEqual(resp.status_code, 400)

    def test_oversize_rejected(self):
        self.client.force_authenticate(_admin())
        buf = io.BytesIO()
        Image.new("RGB", (4200, 4200)).save(buf, format="PNG")
        big = SimpleUploadedFile("big.png", buf.getvalue(), content_type="image/png")
        resp = self.client.post(reverse("admin-branding"), {"field": "logo", "image": big}, format="multipart")
        self.assertEqual(resp.status_code, 400)

    def test_delete_logo(self):
        self.client.force_authenticate(_admin())
        self.client.post(reverse("admin-branding"), {"field": "logo", "image": _png()}, format="multipart")
        resp = self.client.delete(reverse("admin-branding"), data={"field": "logo"}, format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["logo"], "")


class MediaLibraryTests(TestCase):
    def test_upload_list_delete(self):
        self.client.force_authenticate(_admin())
        resp = self.client.post(
            reverse("admin-media"), {"images": [_png("a.png"), _png("b.png")], "title": "تست"}, format="multipart"
        )
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertEqual(len(resp.json()["created"]), 2)

        listing = self.client.get(reverse("admin-media")).json()
        self.assertEqual(len(listing), 2)
        self.assertIn("url", listing[0])

        asset_id = listing[0]["id"]
        resp = self.client.delete(reverse("admin-media-detail", args=[asset_id]))
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(MediaAsset.objects.count(), 1)

    def test_patient_denied(self):
        self.client.force_authenticate(_patient())
        self.assertEqual(self.client.get(reverse("admin-media")).status_code, 403)


class ContentBlockTests(TestCase):
    def test_public_content_public(self):
        SiteContent.objects.create(key="home.hero", data={"title": "سلامتی شما"})
        resp = self.client.get(reverse("public-content"))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["home.hero"]["title"], "سلامتی شما")

    def test_admin_crud(self):
        self.client.force_authenticate(_admin())
        resp = self.client.put(
            reverse("admin-content-detail", args=["home.hero"]),
            data={"title": "عنوان جدید", "badges": ["الف", "ب"]},
            format="json",
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.json()["data"]["title"], "عنوان جدید")

        # Update again
        resp = self.client.put(reverse("admin-content-detail", args=["home.hero"]), data={"title": "دوم"}, format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(SiteContent.objects.filter(key="home.hero").count(), 1)

    def test_invalid_key_rejected(self):
        self.client.force_authenticate(_admin())
        resp = self.client.put(reverse("admin-content-detail", args=["BAD KEY!"]), data={"a": "b"}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_nested_data_rejected(self):
        self.client.force_authenticate(_admin())
        resp = self.client.put(
            reverse("admin-content-detail", args=["home.hero"]), data={"bad": {"nested": 1}}, format="json"
        )
        self.assertEqual(resp.status_code, 400)
