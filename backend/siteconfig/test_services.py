"""Tests for the managed services API (/services page backend)."""
from django.urls import reverse
from rest_framework.test import APITestCase as TestCase

from accounts.models import User
from siteconfig.services_models import Service as ServiceModel


def _admin():
    return User.objects.create_user(username="svc_admin", password="secret123", role=User.Role.ADMIN)


def _patient():
    return User.objects.create_user(username="svc_patient", password="secret123")


class PublicServicesTests(TestCase):
    def test_only_active_shown_ordered(self):
        ServiceModel.objects.create(name="قدیمی", order=2, is_active=True)
        ServiceModel.objects.create(name="اول", order=1, is_active=True)
        ServiceModel.objects.create(name="غیرفعال", order=0, is_active=False)

        resp = self.client.get(reverse("public-services"))
        self.assertEqual(resp.status_code, 200)
        names = [s["name"] for s in resp.json()]
        self.assertEqual(names, ["اول", "قدیمی"])

    def test_image_src_prefers_library(self):
        ServiceModel.objects.create(name="با آیکون", icon="ScanLine", image_url="https://x.example/a.png")
        resp = self.client.get(reverse("public-services")).json()
        self.assertEqual(resp[0]["icon"], "ScanLine")
        self.assertEqual(resp[0]["image_src"], "https://x.example/a.png")


class AdminServicesTests(TestCase):
    def test_patient_denied(self):
        self.client.force_authenticate(_patient())
        self.assertEqual(self.client.get(reverse("admin-services")).status_code, 403)

    def test_create_update_delete(self):
        self.client.force_authenticate(_admin())
        resp = self.client.post(
            reverse("admin-services"),
            data={"name": "هیدروتراپی", "short_desc": "درمان در آب", "icon": "Waves", "order": 5},
            format="json",
        )
        self.assertEqual(resp.status_code, 201, resp.content)
        sid = resp.json()["id"]
        self.assertEqual(resp.json()["icon"], "Waves")

        resp = self.client.patch(
            reverse("admin-service-detail", args=[sid]), data={"short_desc": "آب‌درمانی تخصصی"}, format="json"
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.json()["short_desc"], "آب‌درمانی تخصصی")

        resp = self.client.delete(reverse("admin-service-detail", args=[sid]))
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(ServiceModel.objects.count(), 0)

    def test_invalid_icon_and_empty_name_rejected(self):
        self.client.force_authenticate(_admin())
        resp = self.client.post(reverse("admin-services"), data={"name": "بد آیکون", "icon": "Rocket"}, format="json")
        self.assertEqual(resp.status_code, 400)
        resp = self.client.post(reverse("admin-services"), data={"name": "   "}, format="json")
        self.assertEqual(resp.status_code, 400)
