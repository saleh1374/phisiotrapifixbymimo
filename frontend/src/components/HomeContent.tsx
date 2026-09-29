"use client";

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
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Video,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import CountUp from "@/components/CountUp";
import Reveal from "@/components/Reveal";
import { useAppearance } from "@/components/ThemeProvider";
import { parsePairList, type ContentBlock } from "@/lib/siteContent";

/** The site keeps a sensible default hero photo; the admin can swap it. */
const DEFAULT_HERO_BG = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1800&q=75";
const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1000&q=75";

const TRUST_ICONS = [BadgeCheck, ShieldCheck, Hand, Sparkles];
const SERVICE_ICONS: LucideIcon[] = [ScanLine, Zap, Activity, Dumbbell, Stethoscope, HeartPulse];
const FEATURE_ICONS: LucideIcon[] = [CalendarCheck2, Video, GraduationCap, Newspaper];

function parseNumber(value: string): { num: number; prefix: string; suffix: string } {
  const trimmed = value.trim();
  const prefixMatch = trimmed.match(/^[^0-9]*/);
  const prefix = prefixMatch ? prefixMatch[0] : "";
  const numberMatch = trimmed.match(/\d[\d,]*/);
  const num = numberMatch ? Number(numberMatch[0].replace(/,/g, "")) : 0;
  const suffixStart = numberMatch ? (numberMatch.index ?? 0) + numberMatch[0].length : 0;
  const suffix = trimmed.slice(suffixStart).split("|")[0].trim();
  return { num, prefix, suffix };
}

export default function HomeContent() {
  const { content } = useAppearance();

  const hero = content["home.hero"] ?? {};
  const stats = content["home.stats"] ?? {};
  const services = content["home.services"] ?? {};
  const features = content["home.features"] ?? {};
  const cta = content["home.cta"] ?? {};

  const trustItems = Array.isArray(hero.trust_items) ? hero.trust_items : [];
  const statPairs = parsePairList(Array.isArray(stats.stats) ? (stats.stats as string[]) : undefined);
  const servicePairs = parsePairList(Array.isArray(services.services) ? (services.services as string[]) : undefined);
  const featurePairs = parsePairList(Array.isArray(features.items) ? (features.items as string[]) : undefined);
  const heroImage = typeof hero.hero_image === "string" && hero.hero_image ? hero.hero_image : DEFAULT_HERO_IMAGE;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-dark text-white">
        {/* Background photo */}
        <div className="absolute inset-0">
          <Image
            src={DEFAULT_HERO_BG}
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
            {typeof hero.badge === "string" && hero.badge && (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald/40 bg-emerald/15 px-4 py-1.5 text-sm font-semibold text-emerald-light backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                {hero.badge}
              </span>
            )}
            <h1 className="mt-6 font-black leading-[1.3]">
              {hero.title_line1}
              <br />
              <span className="bg-gradient-to-l from-emerald-light to-gold bg-clip-text text-transparent">
                {hero.title_line2}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
              {hero.description}
            </p>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/65">
              {trustItems.map((label, i) => {
                const Icon = TRUST_ICONS[i % TRUST_ICONS.length];
                return (
                  <li key={label} className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4 text-emerald-light" />
                    {label}
                  </li>
                );
              })}
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
                  {heroImage.startsWith("http") || heroImage.startsWith("/media") ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={heroImage}
                      alt={typeof hero.title_line2 === "string" ? hero.title_line2 : "تصویر کلینیک"}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={DEFAULT_HERO_IMAGE}
                      alt={typeof hero.title_line2 === "string" ? hero.title_line2 : "تصویر کلینیک"}
                      width={1000}
                      height={1500}
                      priority
                      className="aspect-[4/3] w-full object-cover"
                    />
                  )}
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
              {statPairs.map((s, i) => {
                const parsed = parseNumber(s.left);
                return (
                  <Reveal key={s.left + s.right} delay={i * 90}>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur card-lift">
                      <p className="text-xl font-black text-gold sm:text-2xl">
                        <CountUp value={parsed.num} prefix={parsed.prefix} suffix={parsed.suffix} />
                      </p>
                      <p className="mt-1 text-xs text-white/70">{s.right}</p>
                    </div>
                  </Reveal>
                );
              })}
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
            <Sparkles className="h-4 w-4" />
            {services.badge}
          </span>
          <h2 className="mt-4 font-bold">{services.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-navy/60">{services.subtitle}</p>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {servicePairs.map((s, i) => {
            const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
            return (
              <Reveal key={s.left} delay={i * 70}>
                <div className="card-lift group h-full rounded-2xl border border-navy/10 bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald/10 text-emerald transition-colors group-hover:bg-emerald group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-bold">{s.left}</p>
                  <p className="mt-1 text-xs leading-5 text-navy/50">{s.right}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative bg-cream py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-4 py-1.5 text-sm font-bold text-navy/70">
              <Sparkles className="h-4 w-4 text-gold" />
              {features.badge}
            </span>
            <h2 className="mt-4 font-bold">{features.title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-navy/60">{features.subtitle}</p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featurePairs.map((f, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <Reveal key={f.left} delay={i * 90}>
                  <div className="card-lift group relative h-full overflow-hidden rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
                    <span className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full bg-emerald/5 transition-transform duration-500 group-hover:scale-[2.5]" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-emerald text-white shadow-md shadow-emerald/30">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="relative mt-4 text-lg font-bold">{f.left}</h3>
                    <p className="relative mt-2 text-sm leading-7 text-navy/60">{f.right}</p>
                    <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald opacity-0 transition-opacity group-hover:opacity-100">
                      شروع کنید
                      <ArrowLeft className="h-4 w-4" />
                    </span>
                  </div>
                </Reveal>
              );
            })}
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

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-navy p-8 text-center text-white sm:p-14">
            <div className="absolute inset-0 bg-grid-dark opacity-70" />
            <div className="animate-glow absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald/30 blur-3xl" />
            <div className="relative">
              <h2 className="font-bold">{String(cta.title ?? "")}</h2>
              <p className="mx-auto mt-3 max-w-lg leading-8 text-white/70">{String(cta.description ?? "")}</p>
              <Link
                href="/register"
                title={typeof cta.button_label === "string" && cta.button_label ? cta.button_label : "شروع کنید"}
                className="btn-shimmer mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-gold px-8 text-base font-black text-navy shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gold-light"
              >
                {typeof cta.button_label === "string" && cta.button_label ? cta.button_label : "شروع کنید"}
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
