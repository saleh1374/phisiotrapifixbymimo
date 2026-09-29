"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarCheck2, Sparkles } from "lucide-react";

import Reveal from "@/components/Reveal";
import { apiFetch } from "@/lib/api";

export interface ManagedService {
  id: string;
  name: string;
  short_desc: string;
  description: string;
  image_src: string;
  icon: string;
  order: number;
  is_active: boolean;
}

export default function ServicesPage() {
  const { data: services, isLoading } = useQuery({
    queryKey: ["public-services"],
    queryFn: () => apiFetch<ManagedService[]>("/site-editor/public/services/", {}, false),
    staleTime: 60_000,
  });

  const list = services ?? [];

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="relative overflow-hidden bg-navy-dark py-16 text-white sm:py-20">
        <div className="absolute inset-0 bg-grid-dark" />
        <div className="animate-glow absolute -left-24 top-0 h-72 w-72 rounded-full bg-emerald/25 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald/40 bg-emerald/15 px-4 py-1.5 text-sm font-semibold text-emerald-light backdrop-blur">
            <Sparkles className="h-4 w-4" />
            خدمات تخصصی
          </span>
          <h1 className="mt-4 font-black">خدمات کلینیک</h1>
          <p className="mt-3 max-w-2xl leading-8 text-white/70">
            با به‌روزترین تجهیزات و روش‌های علمی روز دنیا، مسیر درمان شما را
            شخصی‌سازی می‌کنیم. روی هر خدمت کلیک کنید و همین حالا نوبت بگیرید.
          </p>
        </div>
        {/* Bottom curve */}
        <div className="absolute inset-x-0 bottom-0 h-6 bg-white [clip-path:ellipse(75%_100%_at_50%_100%)]" />
      </section>

      {/* Services grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {isLoading ? (
          <p className="py-20 text-center text-navy/50">در حال بارگذاری خدمات...</p>
        ) : list.length === 0 ? (
          <p className="py-20 text-center text-navy/50">
            هنوز خدمتی ثبت نشده است — از پنل مدیریت می‌توانید خدمات را اضافه کنید.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((service, i) => (
              <Reveal key={service.id} delay={(i % 3) * 90}>
                <article className="card-lift group flex h-full flex-col overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-sm">
                  {service.image_src ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={service.image_src}
                      alt={service.name}
                      className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex aspect-[3/2] w-full items-center justify-center bg-emerald/10">
                      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald text-white shadow-md shadow-emerald/30">
                        <Sparkles className="h-8 w-8" />
                      </span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-lg font-black">{service.name}</h2>
                    {service.short_desc && (
                      <p className="mt-1 text-sm font-bold text-emerald">{service.short_desc}</p>
                    )}
                    {service.description && (
                      <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-7 text-navy/60">
                        {service.description}
                      </p>
                    )}
                    <Link
                      href="/appointment"
                      title={`رزرو نوبت ${service.name}`}
                      className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-emerald px-5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-emerald-light"
                    >
                      <CalendarCheck2 className="h-4 w-4" />
                      رزرو نوبت
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-navy p-8 text-center text-white sm:p-12">
            <div className="absolute inset-0 bg-grid-dark opacity-70" />
            <div className="animate-glow absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald/30 blur-3xl" />
            <div className="relative">
              <h2 className="font-bold">مطمئن نیستید کدام خدمت مناسب شماست؟</h2>
              <p className="mx-auto mt-3 max-w-lg leading-8 text-white/70">
                یک معاینه تخصصی رزرو کنید تا پزشک بهترین مسیر درمان را به شما پیشنهاد دهد.
              </p>
              <Link
                href="/appointment"
                title="رزرو معاینه"
                className="btn-shimmer mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-gold px-8 text-base font-black text-navy shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gold-light"
              >
                رزرو معاینه تخصصی
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
