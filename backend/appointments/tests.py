import datetime

from rest_framework.test import APITestCase as TestCase
from django.urls import reverse
from django.utils import timezone

from accounts.models import User

from .models import Appointment, DoctorSchedule, Holiday


def _make_doctor(phone="09120000001"):
    return User.objects.create_user(username=f"doc_{phone}", phone_number=phone, full_name="دکتر تست", role=User.Role.DOCTOR)


def _make_patient(phone="09120000002"):
    return User.objects.create_user(username=f"pat_{phone}", phone_number=phone, full_name="بیمار تست")


class AppointmentBookingTests(TestCase):
    def setUp(self):
        self.doctor = _make_doctor()
        self.patient = _make_patient()
        DoctorSchedule.objects.create(
            doctor=self.doctor,
            day_of_week=2,  # Monday (Persian convention: 0=Saturday … 6=Friday)
            start_work="09:00",
            end_work="10:00",
            session_duration=30,
        )
        self.client.force_authenticate(self.patient)

    def _next_monday(self):
        """The next Monday as a date (may be today)."""
        today = timezone.localdate()
        return today + datetime.timedelta(days=(0 - today.weekday()) % 7)

    def _bookable_monday(self):
        """The next Monday that is at least 2 hours in the future.

        If today IS a Monday, the earliest slots have already passed the
        2-hour lead-time check — so book on the following week.
        """
        date = self._next_monday()
        if date == timezone.localdate():
            date += datetime.timedelta(days=7)
        return date

    def _book(self, date=None, start="09:00"):
        return self.client.post(
            reverse("book-appointment"),
            data={
                "doctor_id": str(self.doctor.id),
                "service_type": Appointment.ServiceType.LASER,
                "appointment_date": (date or self._bookable_monday()).isoformat(),
                "start_time": start,
            },
            format="json",
        )

    def test_available_slots(self):
        resp = self.client.get(reverse("slots", args=[self.doctor.id]) + "?date=" + self._bookable_monday().isoformat())
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()), 2)  # 09:00, 09:30

    def test_book_success_and_slot_consumed(self):
        resp = self._book()
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertEqual(Appointment.objects.count(), 1)

        # The slot should now be gone.
        slots = self.client.get(reverse("slots", args=[self.doctor.id]) + "?date=" + self._bookable_monday().isoformat()).json()
        self.assertEqual(len(slots), 1)

    def test_double_booking_conflict(self):
        self.assertEqual(self._book().status_code, 201)
        resp = self._book()
        self.assertEqual(resp.status_code, 409)
        self.assertIn("پر شد", resp.json()["detail"])

    def test_holiday_rejected(self):
        date = self._bookable_monday()
        Holiday.objects.create(doctor=self.doctor, date=date)
        resp = self._book(date=date)
        self.assertEqual(resp.status_code, 409)
        self.assertIn("تعطیل", resp.json()["detail"])

    def test_past_date_rejected(self):
        resp = self._book(date=(timezone.localdate() - datetime.timedelta(days=1)))
        self.assertEqual(resp.status_code, 409)

    def test_too_soon_rejected(self):
        from unittest.mock import patch

        # Freeze "now" so the 2-hour lead check is deterministic.
        frozen = datetime.datetime(2026, 1, 5, 10, 0, tzinfo=datetime.timezone(datetime.timedelta(hours=3, minutes=30)))
        with patch("appointments.services.timezone.localtime", return_value=frozen), patch(
            "appointments.services.timezone.localdate", return_value=frozen.date()
        ):
            resp = self._book(date=frozen.date(), start="10:30")
        self.assertEqual(resp.status_code, 409)
        self.assertIn("ساعت قبل از نوبت", resp.json()["detail"])

    def test_patient_cancel(self):
        resp = self._book()
        pk = resp.json()["id"]
        cancel = self.client.post(reverse("cancel-appointment", args=[pk]))
        self.assertEqual(cancel.status_code, 200)
        self.assertEqual(cancel.json()["status"], Appointment.Status.CANCELED_PATIENT)

    def test_doctor_status_update(self):
        resp = self._book()
        pk = resp.json()["id"]
        self.client.force_authenticate(self.doctor)
        update = self.client.patch(
            reverse("doctor-appointment-status", args=[pk]),
            data={"status": Appointment.Status.NO_SHOW},
            format="json",
        )
        self.assertEqual(update.status_code, 200)
        self.assertEqual(update.json()["status"], Appointment.Status.NO_SHOW)


class AvailabilityTests(TestCase):
    def test_available_days(self):
        doctor = _make_doctor(phone="09120000011")
        DoctorSchedule.objects.create(
            doctor=doctor, day_of_week=2, start_work="09:00", end_work="09:30", session_duration=30
        )  # day_of_week=2 → Monday (Persian convention: 0=Saturday … 6=Friday)
        days = self.client.get(reverse("available-days", args=[doctor.id])).json()
        self.assertIsInstance(days, list)
        if days:  # only if a Monday falls inside the 30-day window
            self.assertIn("date", days[0])
            self.assertGreater(days[0]["free_slots"], 0)