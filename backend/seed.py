"""Seed the database with sample data for the Physiotherapy Clinic.

Usage:
    python manage.py seed
"""
import datetime
import os
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
os.environ.setdefault("DATABASE_ENGINE", "sqlite3")

import django
django.setup()

from django.contrib.auth.hashers import make_password
from django.utils import timezone

from accounts.models import User
from academy.models import Certificate, Course, CourseChapter, Order
from appointments.models import Appointment, DoctorSchedule, Holiday
from news.models import NewsFeed
from siteconfig.models import SiteSetting
from videos.models import Video

TODAY = timezone.localdate()
NOW = timezone.now()


def seed():
    print("=== Seeding database ===\n")

    # --- Site settings ---
    s = SiteSetting.get()
    s.site_name = "کلینیک فیزیوتراپی"
    s.site_tagline = "رزرو نوبت، فیلم آموزشی و آکادمی تخصصی"
    s.site_description = "کلینیک فیزیوتراپی پیشرو با تیم مجرب پزشکان و امکانات پیشرفته"
    s.announcement = "⏰ نوبت‌دهی آنلاین فعال است — همین الان وقت رزرو کنید!"
    s.contact_phone = "۰۲۱-۸۸۷۷۶۶۵۵"
    s.contact_email = "info@physioclinic.ir"
    s.address = "تهران، خیابان آزادی، پلاک ۱۲۳، طبقه ۲"
    s.working_hours = "شنبه تا پنجشنبه ۹ صبح تا ۸ شب"
    s.otp_backend = "console"
    s.save()
    print("[OK] Site settings")

    # --- Users ---
    doctors_data = [
        {"username": "dr_sara", "full_name": "دکتر سارا محمدی", "phone_number": "09121000001",
         "specialty": "فیزیوتراپی ارتوپدیک", "medical_license_number": "۱۲۳۴۵",
         "bio": "فوق تخصص فیزیوتراپی ارتوپدیک با ۱۵ سال سابقه کاری. عضو انجمن فیزیوتراپی ایران."},
        {"username": "dr_amir", "full_name": "دکتر علی کریمی", "phone_number": "09121000002",
         "specialty": "فیزیوتراپی عصبی", "medical_license_number": "۱۲۳۴۶",
         "bio": "متخصص فیزیوتراپی عصبی و توانبخشی بیماران سکته مغزی."},
        {"username": "dr_mohammadi", "full_name": "دکتر سارا محمدی", "phone_number": "09121000003",
         "specialty": "فیزیوتراپی ورزشی", "medical_license_number": "۱۲۳۴۷",
         "bio": "فیزیوتراپیست ورزشی، مشاور تیم‌های ملی و باشگاهی."},
        {"username": "dr_hashemi", "full_name": "دکتر حسن هاشمی", "phone_number": "09121000004",
         "specialty": "طب سوزنی و تکارتراپی", "medical_license_number": "۱۲۳۴۸",
         "bio": "متخصص طب سوزنی و فیزیوتراپی مدرن با ۱۰ سال تجربه."},
    ]

    doctor_users = []
    for d in doctors_data:
        user, created = User.objects.get_or_create(
            username=d["username"],
            defaults={
                "full_name": d["full_name"],
                "phone_number": d["phone_number"],
                "role": "doctor",
                "specialty": d["specialty"],
                "medical_license_number": d["medical_license_number"],
                "bio": d["bio"],
                "is_active": True,
            },
        )
        if created:
            user.password = make_password("demo1234")
            user.save(update_fields=["password"])
        doctor_users.append(user)
        status = "CREATED" if created else "EXISTS"
        print(f"[{status}] Doctor: {d['full_name']}")

    # --- Patients ---
    patients_data = [
        {"username": "ali_rezaei", "full_name": "علی رضایی", "phone_number": "09122000001",
         "email": "ali@example.com"},
        {"username": "mina_ahmadi", "full_name": "مینا احمدی", "phone_number": "09122000002",
         "email": "mina@example.com"},
        {"username": "reza_hosseini", "full_name": "رضا حسینی", "phone_number": "09122000003",
         "email": "reza@example.com"},
        {"username": "sara_najafi", "full_name": "سارا نجفی", "phone_number": "09122000004",
         "email": "sara@example.com"},
    ]

    patient_users = []
    for p in patients_data:
        user, created = User.objects.get_or_create(
            username=p["username"],
            defaults={
                "full_name": p["full_name"],
                "phone_number": p["phone_number"],
                "email": p["email"],
                "role": "patient",
                "is_active": True,
            },
        )
        if created:
            user.password = make_password("demo1234")
            user.save(update_fields=["password"])
        patient_users.append(user)
        status = "CREATED" if created else "EXISTS"
        print(f"[{status}] Patient: {p['full_name']}")

    # --- Doctor schedules ---
    schedules_created = 0
    for doctor in doctor_users:
        for day in range(6):  # Saturday=0 to Thursday=5
            schedule, created = DoctorSchedule.objects.get_or_create(
                doctor=doctor,
                day_of_week=day,
                defaults={
                    "start_work": datetime.time(8, 0),
                    "end_work": datetime.time(17, 0),
                    "break_start": datetime.time(12, 0),
                    "break_end": datetime.time(13, 0),
                    "session_duration": 30,
                },
            )
            if created:
                schedules_created += 1
    print(f"[OK] Doctor schedules ({schedules_created} shifts)")

    # --- Courses ---
    cover_images = [
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80",
        "https://images.unsplash.com/photo-1574279606130-09157e8db158?w=600&q=80",
    ]

    courses_data = [
        {
            "title": "فیزیوتراپی کمردرد مزمن",
            "description": "دوره جامع درمان کمردرد مزمن شامل تمرینات اصلاحی، تکنیک‌های دستی و آموزش ارگونومی. مناسب برای بیماران و متخصصین.",
            "price": 850000, "discount_price": 590000,
            "level": "مقدماتی", "total_hours": 12.5, "is_free": False,
            "cover_image": cover_images[0],
            "chapters": [
                ("آشنایی با آناتومی کمر", 45, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("علل کمردرد مزمن", 35, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("تست‌های تشخیصی", 40, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("تمرینات اصلاحی پایه", 50, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("تکنیک‌های دستی کمر", 55, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("ارگونومی و پیشگیری", 30, "https://www.w3schools.com/html/mov_bbb.mp4"),
            ],
        },
        {
            "title": "توانبخشی زانو بعد از آرتروز",
            "description": "برنامه توانبخشی کامل برای بیماران مبتلا به آرتروز زانو. شامل تمرینات تقویتی، تعادلی و آموزش حرکتی.",
            "price": 750000, "discount_price": None,
            "level": "پیشرفته", "total_hours": 10.0, "is_free": False,
            "cover_image": cover_images[1],
            "chapters": [
                ("آناتومی و فیزیولوژی زانو", 40, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("آرتروز زانو و مکانیزم بیماری", 35, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("تمرینات تقویت عضلات ران", 50, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("تمرینات تعادل و هماهنگی", 45, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("آموزش استفاده از وسایل کمکی", 30, "https://www.w3schools.com/html/mov_bbb.mp4"),
            ],
        },
        {
            "title": "فیزیوتراپی گردن و شانه",
            "description": "آموزش جامع درمان دردهای گردن و شانه شامل سندرم تونل کارپال، التهاب تاندون و گردن‌درد مزمن.",
            "price": 0, "discount_price": None,
            "level": "مقدماتی", "total_hours": 8.0, "is_free": True,
            "cover_image": cover_images[2],
            "chapters": [
                ("آناتومی گردن و شانه", 35, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("علل درد گردن", 30, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("تمرینات کششی گردن", 40, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("تقویت عضلات شانه", 45, "https://www.w3schools.com/html/mov_bbb.mp4"),
            ],
        },
        {
            "title": "طب سوزنی در فیزیوتراپی",
            "description": "دوره تخصصی طب سوزنی خشک (Dry Needling) برای درمان نقاط ماشه‌ای و دردهای عضلانی.",
            "price": 1200000, "discount_price": 950000,
            "level": "تخصصی", "total_hours": 15.0, "is_free": False,
            "cover_image": cover_images[3],
            "chapters": [
                ("مبانی طب سوزنی", 50, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("نقطه‌های ماشه‌ای", 45, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("تکنیک‌های سوزن‌زنی", 55, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("کاربرد در کمردرد", 40, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("کاربرد در گردن‌درد", 40, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("ایمنی و ملاحظات", 30, "https://www.w3schools.com/html/mov_bbb.mp4"),
            ],
        },
        {
            "title": "تکارتراپی (TECAR)",
            "description": "آموزش کاربرد دستگاه TECAR در فیزیوتراپی برای درمان آسیب‌های بافت نرم و التهاب مفصلی.",
            "price": 900000, "discount_price": None,
            "level": "پیشرفته", "total_hours": 6.0, "is_free": False,
            "cover_image": cover_images[4],
            "chapters": [
                ("اصول TECAR", 40, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("کاربرد در آسیب‌های ورزشی", 45, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("کاربرد در دردهای مزمن", 40, "https://www.w3schools.com/html/mov_bbb.mp4"),
            ],
        },
        {
            "title": "لیزرتراپی در درمان درد",
            "description": "دوره جامع لیزر درمانی سطح پایین (LLLT) و کاربرد آن در درمان التهاب و بازسازی بافت.",
            "price": 650000, "discount_price": 490000,
            "level": "تخصصی", "total_hours": 7.5, "is_free": False,
            "cover_image": cover_images[5],
            "chapters": [
                ("فیزیک لیزر در پزشکی", 35, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("پروتکل‌های درمانی", 50, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("کاربرد بالینی", 45, "https://www.w3schools.com/html/mov_bbb.mp4"),
                ("ایمنی لیزر", 30, "https://www.w3schools.com/html/mov_bbb.mp4"),
            ],
        },
    ]

    course_objects = []
    for cd in courses_data:
        course, created = Course.objects.get_or_create(
            title=cd["title"],
            defaults={
                "description": cd["description"],
                "price": cd["price"],
                "discount_price": cd["discount_price"],
                "cover_image": cd["cover_image"],
                "level": cd["level"],
                "total_hours": cd["total_hours"],
                "is_free": cd["is_free"],
                "instructor": doctor_users[0],
            },
        )
        course_objects.append(course)
        if created:
            for i, (title, dur, url) in enumerate(cd["chapters"], 1):
                CourseChapter.objects.create(
                    course=course,
                    chapter_title=title,
                    video_url=url,
                    duration_minutes=dur,
                    sort_order=i,
                )
        status = "CREATED" if created else "EXISTS"
        print(f"[{status}] Course: {cd['title']}")

    # --- Videos ---
    videos_data = [
        {"title": "تمرینات کششی کمر برای دیسک کمر",
         "description": "مجموعه تمرینات کششی ایمن برای بیماران مبتلا به دیسک کمر. این تمرینات به کاهش فشار بر ریشه‌های عصبی کمک می‌کنند.",
         "body_part": "کمر", "injury_type": "دیسک", "duration_minutes": 12,
         "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
         "thumbnail": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70",
         "view_count": 1250},
        {"title": "تقویت عضلات شانه بعد از آسیب",
         "description": "برنامه تقویتی تدریجی برای بازیابی قدرت و دامنه حرکتی شانه بعد از آسیگ روتاتور کاف.",
         "body_part": "شانه", "injury_type": "بعد از جراحی", "duration_minutes": 15,
         "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
         "thumbnail": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70",
         "view_count": 890},
        {"title": "تمرینات تعادلی برای آرتروز زانو",
         "description": "تمرینات تعادلی و proprioceptive برای بیماران مبتلا به آرتروز زانو. مناسب سطح مقدماتی.",
         "body_part": "زانو", "injury_type": "آرتروز", "duration_minutes": 10,
         "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
         "thumbnail": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=70",
         "view_count": 2100},
        {"title": "گردن‌درد و تمرینات اصلاحی",
         "description": "آموزش تمرینات اصلاحی برای درمان گردن‌درد ناشی از کار با کامپیوتر و ژست نامناسب.",
         "body_part": "گردن", "injury_type": "کشیدگی", "duration_minutes": 8,
         "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
         "thumbnail": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70",
         "view_count": 3400},
        {"title": "توانبخشی مچ پا بعد از پیچ‌خوردگی",
         "description": "مراحل توانبخشی پیچ‌خوردگی مچ پا از فاز حاد تا بازگشت به فعالیت ورزشی.",
         "body_part": "مچ پا", "injury_type": "کشیدگی", "duration_minutes": 14,
         "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
         "thumbnail": "https://images.unsplash.com/photo-1574279606130-09157e8db158?w=400&q=70",
         "view_count": 760},
        {"title": "تمرینات لگن برای دردهای لگنی",
         "description": "مجموعه تمرینات تقویتی و کششی برای درمان دردهای لگن و سیاتیک.",
         "body_part": "لگن", "injury_type": "کشیدگی", "duration_minutes": 11,
         "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
         "thumbnail": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=70",
         "view_count": 1500},
        {"title": "کشیدگی رباط صلیبی: تمرینات مرحله اول",
         "description": "تمرینات فاز اول توانبخشی ACL شامل حرکات غیرباری و تقویت ایزومتریک.",
         "body_part": "زانو", "injury_type": "بعد از جراحی", "duration_minutes": 18,
         "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
         "thumbnail": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=70",
         "view_count": 4200},
        {"title": "تمرینات تنفسی برای فیبرومیالژی",
         "description": "تکنیک‌های تنفسی و آرام‌سازی برای مدیریت درد در بیماران فیبرومیالژی.",
         "body_part": "کمر", "injury_type": "آرتروز", "duration_minutes": 9,
         "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
         "thumbnail": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70",
         "view_count": 650},
        {"title": "گرم‌کردن قبل از ورزش",
         "description": "برنامه گرم‌کردن کامل برای پیشگیری از آسیب در ورزشکاران.",
         "body_part": "شانه", "injury_type": "کشیدگی", "duration_minutes": 7,
         "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
         "thumbnail": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70",
         "view_count": 5600},
        {"title": "سردکردن و کشش بعد از تمرین",
         "description": "آموزش اصول سردکردن و کشش بعد از فعالیت ورزشی برای پیشگیری از آسیب.",
         "body_part": "زانو", "injury_type": "کشیدگی", "duration_minutes": 8,
         "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
         "thumbnail": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=70",
         "view_count": 4800},
    ]

    for vd in videos_data:
        video, created = Video.objects.get_or_create(
            title=vd["title"],
            defaults={
                "description": vd["description"],
                "video_url": vd["video_url"],
                "thumbnail": vd["thumbnail"],
                "body_part": vd["body_part"],
                "injury_type": vd["injury_type"],
                "is_public": True,
                "uploaded_by": doctor_users[0],
                "view_count": vd["view_count"],
                "duration_minutes": vd["duration_minutes"],
            },
        )
        status = "CREATED" if created else "EXISTS"
        print(f"[{status}] Video: {vd['title']}")

    # --- News articles ---
    news_data = [
        {
            "title_fa": "نقش فیزیوتراپی در بازتوانی بیماران کرونایی",
            "title_en": "Role of Physiotherapy in COVID-19 Recovery",
            "summary_fa": "مطالعات جدید نشان می‌دهد فیزیوتراپی تنفسی نقش مهمی در بازتوانی بیماران مبتلا به کووید-۱۹ دارد. تمرینات تنفسی و تقویت عضلات تنفسی به بهبود ظرفیت ریه کمک می‌کند.",
            "category": "تحقیقات بالینی",
            "source_url": "https://example.com/news/1",
            "image_url": "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&q=80",
            "published_at": TODAY - datetime.timedelta(days=2),
        },
        {
            "title_fa": "کنگره بین‌المللی فیزیوتراپی ۲۰۲۶ تهران",
            "title_en": "International Physiotherapy Congress 2026 Tehran",
            "summary_fa": "کنگره بین‌المللی فیزیوتراپی با حضور متخصصان از ۳۰ کشور در تهران برگزار می‌شود. موضوعات: توانبخشی عصبی، فیزیوتراپی ورزشی و طب سوزنی.",
            "category": "همایش‌ها",
            "source_url": "https://example.com/news/2",
            "image_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
            "published_at": TODAY - datetime.timedelta(days=5),
        },
        {
            "title_fa": "دستگاه TECAR: فناوری نوین در درمان درد مزمن",
            "title_en": "TECAR: New Technology in Chronic Pain Treatment",
            "summary_fa": "دستگاه TECAR با استفاده از امواج رادیویی فرکانس بالا باعث افزایش گردش خون و کاهش التهاب می‌شود. نتایج بالینی نشان‌دهنده کاهش ۴۰٪ درد در بیماران است.",
            "category": "تکنولوژی روز",
            "source_url": "https://example.com/news/3",
            "image_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
            "published_at": TODAY - datetime.timedelta(days=7),
        },
        {
            "title_fa": "مطالعه: یوگا در درمان کمردرد مزمن موثرتر از دارو",
            "title_en": "Study: Yoga More Effective Than Drugs for Chronic Back Pain",
            "summary_fa": "یک مطالعه بالینی ۱۲ ماهه نشان داده بیمارانی که یوگا انجام دادند ۶۰٪ بهبود بیشتری در درد کمر نسبت به گروه دارویی داشتند.",
            "category": "تحقیقات بالینی",
            "source_url": "https://example.com/news/4",
            "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
            "published_at": TODAY - datetime.timedelta(days=10),
        },
        {
            "title_fa": "متدهای نوین در توانبخشی ورزشی",
            "title_en": "Modern Methods in Sports Rehabilitation",
            "summary_fa": "استفاده از واقعیت مجازی در توانبخشی ورزشی نتایج امیدوارکننده‌ای داشته. بیماران با استفاده از VR تمرینات بهتری انجام می‌دهند.",
            "category": "متدهای نوین",
            "source_url": "https://example.com/news/5",
            "image_url": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
            "published_at": TODAY - datetime.timedelta(days=12),
        },
        {
            "title_fa": "لیزر درمانی: مزایا و محدودیت‌ها",
            "title_en": "Laser Therapy: Benefits and Limitations",
            "summary_fa": "بررسی جامع مزایا و محدودیت‌های لیزر درمانی سطح پایین در درمان آسیب‌های ارتوپدیک. لیزر درمانی می‌تواند روند ترمیم بافت را تسریع کند.",
            "category": "تکنولوژی روز",
            "source_url": "https://example.com/news/6",
            "image_url": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
            "published_at": TODAY - datetime.timedelta(days=15),
        },
    ]

    for nd in news_data:
        article, created = NewsFeed.objects.get_or_create(
            source_url=nd["source_url"],
            defaults={
                "title_fa": nd["title_fa"],
                "title_en": nd["title_en"],
                "summary_fa": nd["summary_fa"],
                "image_url": nd["image_url"],
                "category": nd["category"],
                "is_published": True,
                "published_at": nd["published_at"],
            },
        )
        status = "CREATED" if created else "EXISTS"
        print(f"[{status}] News: {nd['title_fa'][:40]}...")

    # --- Sample appointments ---
    appt_count = 0
    for i, patient in enumerate(patient_users[:3]):
        doctor = doctor_users[i % len(doctor_users)]
        for day_offset in [1, 3, 7]:
            date = TODAY + datetime.timedelta(days=day_offset)
            if date.weekday() >= 5:  # Skip weekends (Friday=4, Saturday=5 in Python)
                continue
            try:
                Appointment.objects.get_or_create(
                    patient=patient,
                    doctor=doctor,
                    appointment_date=date,
                    start_time=datetime.time(9, 0),
                    defaults={
                        "service_type": "طب سوزنی",
                        "end_time": datetime.time(9, 30),
                        "status": "confirmed",
                        "description": "ویزیت اولیه و بررسی وضعیت",
                    },
                )
                appt_count += 1
            except Exception:
                pass
    print(f"[OK] Appointments ({appt_count})")

    # --- Sample orders ---
    for patient in patient_users[:2]:
        for course in course_objects[:2]:
            if course.is_free:
                continue
            Order.objects.get_or_create(
                user=patient,
                course=course,
                defaults={
                    "transaction_code": f"TXN-{patient.username[:3]}-{course.title[:10]}",
                    "amount_paid": course.final_price,
                    "payment_status": "paid",
                },
            )
    print("[OK] Orders")

    print("\n=== Seeding complete! ===")
    print("\nDemo logins:  admin/admin123   doctors → dr_sara, dr_amir, dr_mohammadi, dr_hashemi (demo1234)   patients (demo1234)")


if __name__ == "__main__":
    seed()
