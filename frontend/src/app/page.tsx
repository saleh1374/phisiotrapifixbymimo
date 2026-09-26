import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Award,
  BadgeCheck,
  CalendarCheck2,
  Dumbbell,
  GraduationCap,
  Hand,
  HeartPulse,
  Newspaper,
  PlayCircle,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Video,
  Zap,
} from "lucide-react";

import CountUp from "@/components/CountUp";
import Reveal from "@/components/Reveal";

const FEATURES = [
  {
    icon: CalendarCheck2,
    title: "رزرو نوبت هوشمند",
    desc: "انتخاب پزشک، تاریخ و ساعت با تقویم شمسی؛ بدون نیاز به تماس تلفنی و با جلوگیری از رزرو همزمان.",
  },
  {
    icon: Video,
    title: "فیلم‌های آموزشی اختصاصی",
    desc: "تمرینات تجویز شده توسط پزشک، همراه با پیگیری خودکار پیشرفت شما.",
  },
  {
    icon: GraduationCap,
    title: "آکادمی تخصصی",
    desc: "دوره‌های آموزشی فیزیوتراپی با گواهی‌نامه معتبر و کد اصالت قابل استعلام.",
  },
  {
    icon: Newspaper,
    title: "مجله علمی",
    desc: "جدیدترین تحقیقات و متدهای روز جهان، اسکن و ترجمه شده به فارسی روان.",
  },
];

const SERVICES = [
  { name: "لیزرتراپی", icon: ScanLine, desc: "لیزر سطح پایین برای تسریع ترمیم بافت" },
  { name: "تکارتراپی", icon: Zap, desc: "انرژی رادیویی برای دردهای مزمن" },
  { name: "طب سوزنی", icon: Activity, desc: "درمان نقاط ماشه‌ای و درد عضلانی" },
  { name: "ورزش درمانی", icon: Dumbbell, desc: "برنامه تمرینی شخصی‌سازی‌شده" },
  { name: "معاینه تخصصی", icon: Stethoscope, desc: "ارزیابی دقیق وضعیت حرکتی" },
  { name: "دستگاه‌های مدرن", icon: HeartPulse, desc: "تجهیزات روز توانبخشی" },
];

const TRUST_ITEMS = [
  { icon: BadgeCheck, label: "کادر مجرب و دارای بورد" },
  { icon: ShieldCheck, label: "پروتکل‌های علمی و استاندارد" },
  { icon: Hand, label: "برنامه درمان اختصاصی" },
  { icon: Sparkles, label: "تجهیزات به‌روز اروپایی" },
];

const STATS: Array<{ value: number; prefix?: string; suffix?: string; label: string }> = [
  { value: 12, suffix: "+", label: "سال سابقه" },
  { value: 8000, suffix: "+", label: "بیمار موفق" },
  { value: 20, suffix: "+", label: "پزشک متخصص" },
  { value: 95, prefix: "٪", label: "رضایت بیماران" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "MedicalClinic"],
      name: "کلینیک فیزیوتراپی",
      description: "کلینیک تخصصی فیزیوتراپی با خدمات لیزر، تکار، طب سوزنی و ورزش درمانی",
      telephone: "+98-21-88776655",
      address: {
        "@type": "PostalAddress",
        streetAddress: "خیابان آزادی، پلاک ۱۲۳",
        addressLocality: "تهران",
        addressCountry: "IR",
      },
      openingHours: "Sa-Th 09:00-20:00",
      priceRange: "$$",
    },
    {
      "@type": "Physician",
      name: "دکتر سارا محمدی",
      specialty: "فیزیوتراپی ورزشی",
      worksFor: { "@type": "MedicalClinic", name: "کلینیک فیزیوتراپی" },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-dark text-white">
        {/* Background photo */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1800&q=75"
            alt=""
            fill
            priority
            className="object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-navy-dark via-navy-dark/85 to-navy-dark/60" />
          <div className="absolute inset-0 bg-grid-dark" />
          <div className="animate-glow absolute -right-32 top-10 h-96 w-96 rounded-full bg-emerald/25 blur-3xl" />
          <div className="animate-glow absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-gold/15 blur-3xl [animation-delay:-7s]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald/40 bg-emerald/15 px-4 py-1.5 text-sm font-semibold text-emerald-light backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              کلینیک تخصصی فیزیوتراپی و توانبخشی
            </span>
            <h1 className="mt-6 font-black leading-[1.3]">
              سلامتی شما،
              <br />
              <span className="bg-gradient-to-l from-emerald-light to-gold bg-clip-text text-transparent">
                اولویت ماست
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
              رزرو نوبت آنلاین با تقویم شمسی، فیلم‌های آموزشی اختصاصی، دوره‌های
              تخصصی با گواهی معتبر و جدیدترین اخبار دنیای فیزیوتراپی — همه در
              یک پلتفرم.
            </p>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/65">
              {TRUST_ITEMS.map((t) => (
                <li key={t.label} className="flex items-center gap-1.5">
                  <t.icon className="h-4 w-4 text-emerald-light" />
                  {t.label}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/appointment"
                title="رزرو نوبت آنلاین"
                className="btn-shimmer inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald px-7 text-base font-bold text-white shadow-lg shadow-emerald/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-light"
              >
                <CalendarCheck2 className="h-5 w-5" />
                رزرو نوبت
              </Link>
              <Link
                href="/videos"
                title="کتابخانه فیلم‌ها"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/25 px-7 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                <PlayCircle className="h-5 w-5" />
                فیلم‌های آموزشی
              </Link>
            </div>
          </div>
          <div className="relative">
            <Reveal delay={150}>
              <div className="relative">
                {/* Corner accents */}
                <div className="absolute -right-3 -top-3 h-16 w-16 rounded-tr-3xl border-r-2 border-t-2 border-gold/60" />
                <div className="absolute -bottom-3 -left-3 h-16 w-16 rounded-bl-3xl border-b-2 border-l-2 border-emerald/60" />
                <div className="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/20">
                  <Image
                    src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1000&q=75"
                    alt="جلسه درمان دستی فیزیوتراپی در کلینیک"
                    width={1000}
                    height={1500}
                    priority
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
                {/* Floating stat card */}
                <div className="animate-float absolute -bottom-6 right-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-navy/85 px-4 py-3 shadow-xl backdrop-blur">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/20 text-emerald-light">
                    <HeartPulse className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-black text-white">مانیتورینگ پیشرفت</span>
                    <span className="block text-xs text-white/60">پیگیری لحظه‌ای تمرینات</span>
                  </span>
                </div>
              </div>
            </Reveal>

            <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={i * 90}>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur card-lift">
                    <p className="text-xl font-black text-gold sm:text-2xl">
                      <CountUp value={s.value} prefix={s.prefix ?? ""} suffix={s.suffix ?? ""} />
                    </p>
                    <p className="mt-1 text-xs text-white/70">{s.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom curve */}
        <div className="relative h-8 bg-white [clip-path:ellipse(75%_100%_at_50%_100%)]" />
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald/10 px-4 py-1.5 text-sm font-bold text-emerald">
            <Activity className="h-4 w-4" />
            خدمات تخصصی
          </span>
          <h2 className="mt-4 font-bold">خدمات کلینیک</h2>
          <p className="mx-auto mt-3 max-w-xl text-navy/60">
            درمان تخصصی با به‌روزترین تجهیزات و روش‌های علمی روز دنیا
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SERVICES.map((s, i) => (
            <Reveal key={s.name} delay={i * 70}>
              <div className="card-lift group h-full rounded-2xl border border-navy/10 bg-white p-5 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald/10 text-emerald transition-colors group-hover:bg-emerald group-hover:text-white">
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-bold">{s.name}</p>
                <p className="mt-1 text-xs leading-5 text-navy/50">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-4 py-1.5 text-sm font-bold text-navy/70">
              <Sparkles className="h-4 w-4 text-gold" />
              پلتفرم یکپارچه
            </span>
            <h2 className="mt-4 font-bold">چهار ماژول اصلی پلتفرم</h2>
            <p className="mx-auto mt-3 max-w-xl text-navy/60">
              از رزرو نوبت تا آموزش و پیگیری — یک تجربه کامل و یکپارچه
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <div className="card-lift group relative h-full overflow-hidden rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
                  <span className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full bg-emerald/5 transition-transform duration-500 group-hover:scale-[2.5]" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-emerald text-white shadow-md shadow-emerald/30">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="relative mt-4 text-lg font-bold">{f.title}</h3>
                  <p className="relative mt-2 text-sm leading-7 text-navy/60">{f.desc}</p>
                  <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald opacity-0 transition-opacity group-hover:opacity-100">
                    شروع کنید
                    <ArrowLeft className="h-4 w-4" />
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment showcase */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=1000&q=75"
                  alt="تمرینات اصلاحی و ورزش درمانی"
                  width={1000}
                  height={667}
                  className="aspect-[3/2] w-full object-cover"
                />
              </div>
              <div className="absolute -top-5 right-8 rounded-2xl bg-navy px-5 py-3 text-white shadow-xl">
                <p className="text-xs text-white/60">زمان انتظار</p>
                <p className="text-lg font-black text-gold">کمتر از ۱ دقیقه</p>
              </div>
            </Reveal>
          </div>
          <div className="order-1 lg:order-2">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald/10 px-4 py-1.5 text-sm font-bold text-emerald">
                <CalendarCheck2 className="h-4 w-4" />
                رزرو هوشمند
              </span>
              <h2 className="mt-4 font-bold">نوبت بگیرید، بدون تماس تلفنی</h2>
              <ul className="mt-6 space-y-3.5 text-navy/70">
                {[
                  "تقویم شمسی با نمایش روزهای دارای نوبت خالی",
                  "انتخاب خدمت، پزشک، تاریخ و ساعت در ۴ مرحله ساده",
                  "جلوگیری از رزرو همزمان با قفل تراکنشی دیتابیس",
                  "لغو آنلاین نوبت و پیگیری تاریخچه درمان",
                ].map((item, i) => (
                  <Reveal key={item} delay={i * 80}>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald/10">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald" />
                      </span>
                      <span className="leading-7">{item}</span>
                    </div>
                  </Reveal>
                ))}
              </ul>
              <Link
                href="/appointment"
                title="رزرو نوبت آنلاین"
                className="btn-shimmer mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald px-7 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-emerald-light"
              >
                همین حالا رزرو کنید
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Academy teaser */}
      <section id="academy" className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-emerald to-emerald-light text-white shadow-xl">
            <div className="absolute inset-0 bg-grid-dark opacity-60" />
            <div className="animate-glow absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold">
                  <Award className="h-4 w-4" />
                  گواهی‌نامه معتبر با QR کد
                </span>
                <h2 className="mt-4 font-bold">آکادمی تخصصی فیزیوتراپی</h2>
                <p className="mt-3 leading-8 text-white/85">
                  دوره‌های آموزشی از مقدماتی تا تخصصی با مدرسان مجرب. پس از اتمام
                  ۱۰۰٪ دوره، گواهی‌نامه رسمی با شماره یکتا و کد اصالت دریافت
                  می‌کنید که با اسکن QR قابل استعلام است.
                </p>
                <Link
                  href="/academy"
                  title="مشاهده دوره‌ها"
                  className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-7 text-base font-bold text-emerald shadow-lg transition-transform hover:scale-[1.03]"
                >
                  مشاهده دوره‌ها
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Image
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=640&q=75"
                  alt="کلاس آموزشی ورزش درمانی"
                  width={640}
                  height={427}
                  className="aspect-[3/2] w-full rounded-2xl object-cover shadow-lg ring-1 ring-white/25"
                />
                <Image
                  src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=640&q=75"
                  alt="تمرینات توانبخشی"
                  width={640}
                  height={427}
                  className="aspect-[3/2] w-full rounded-2xl object-cover shadow-lg ring-1 ring-white/25"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Magazine teaser */}
      <section id="magazine" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-sm font-bold text-navy/80">
                <Newspaper className="h-4 w-4" />
                خبرخوان خودکار
              </span>
              <h2 className="mt-4 font-bold">مجله علمی فیزیوتراپی</h2>
              <p className="mt-3 leading-8 text-navy/60">
                معتبرترین منابع جهانی فیزیوتراپی هر ۶ ساعت اسکن می‌شوند؛ مقالات
                به فارسی روان ترجمه و پس از تایید تیم علمی منتشر می‌شوند. همیشه
                از آخرین تحقیقات بالینی باخبر باشید.
              </p>
              <Link
                href="/magazine"
                title="ورود به مجله علمی"
                className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-navy px-7 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-navy-light"
              >
                ورود به مجله
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Reveal>
          </div>
          <div className="order-1 lg:order-2">
            <Reveal delay={120}>
              <div className="overflow-hidden rounded-3xl shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=1000&q=75"
                  alt="مجله علمی فیزیوتراپی"
                  width={1000}
                  height={667}
                  className="aspect-[3/2] w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-navy p-8 text-center text-white sm:p-14">
            <div className="absolute inset-0 bg-grid-dark opacity-70" />
            <div className="animate-glow absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald/30 blur-3xl" />
            <div className="relative">
              <h2 className="font-bold">همین حالا نوبت خود را رزرو کنید</h2>
              <p className="mx-auto mt-3 max-w-lg leading-8 text-white/70">
                ثبت‌نام تنها چند ثانیه زمان می‌برد؛ با نام کاربری و رمز عبور یا
                حساب گوگل وارد شوید و از تمام خدمات استفاده کنید.
              </p>
              <Link
                href="/register"
                title="شروع کنید"
                className="btn-shimmer mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-gold px-8 text-base font-black text-navy shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gold-light"
              >
                شروع کنید
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}