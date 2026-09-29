"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Reveal from "@/components/Reveal";
import { apiFetch } from "@/lib/api";
import type { ManagedService } from "@/app/services/page";

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  ScanLine: Sparkles,
  Zap: Sparkles,
  Activity: Sparkles,
  Dumbbell: Sparkles,
  Stethoscope: Sparkles,
  HeartPulse: Sparkles,
};

interface Props {
  fallbackBadge: string;
  fallbackTitle: string;
  fallbackSubtitle: string;
}

export default function HomeServicesSection({ fallbackBadge, fallbackTitle, fallbackSubtitle }: Props) {
  const { data: services } = useQuery({
    queryKey: ["public-services"],
    queryFn: () => apiFetch<ManagedService[]>("/site-editor/public/services/", {}, false),
    staleTime: 60_000,
  });

  const managed = (services ?? []).slice(0, 6);
  const useManaged = managed.length > 0;

  // Fallback items come from the editable content block (پنل → محتوای صفحات).
  const fallbackItems: { name: string; desc: string }[] = [];

  return (
    <section id="services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <Reveal className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald/10 px-4 py-1.5 text-sm font-bold text-emerald">
          <Sparkles className="h-4 w-4" />
          {fallbackBadge}
        </span>
        <h2 className="mt-4 font-bold">{fallbackTitle}</h2>
        <p className="mx-auto mt-3 max-w-xl text-navy/60">{fallbackSubtitle}</p>
      </Reveal>

      {useManaged ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {managed.map((service, i) => (
            <Reveal key={service.id} delay={i * 70}>
              <Link
                href="/services"
                title={`${service.name} — توضیح کامل`}
                className="card-lift group block h-full rounded-2xl border border-navy/10 bg-white p-5 text-center shadow-sm"
              >
                {service.image_src ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={service.image_src}
                    alt={service.name}
                    className="mx-auto aspect-square w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald/10 text-emerald transition-colors group-hover:bg-emerald group-hover:text-white">
                    <Sparkles className="h-6 w-6" />
                  </div>
                )}
                <p className="mt-3 text-sm font-bold">{service.name}</p>
                <p className="mt-1 text-xs leading-5 text-navy/50">{service.short_desc}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {fallbackItems.length === 0 && null}
        </div>
      )}

      <Reveal className="mt-8 text-center">
        <Link
          href="/services"
          title="مشاهده همه خدمات"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald/40 px-6 text-sm font-bold text-emerald transition-colors hover:bg-emerald/5"
        >
          مشاهده همه خدمات
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Reveal>
    </section>
  );
}
