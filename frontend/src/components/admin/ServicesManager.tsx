"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { apiFetch, errorMessage } from "@/lib/api";
import { inputCls, labelCls } from "@/lib/admin";
import type { ManagedService } from "@/app/services/page";

interface MediaAsset {
  id: string;
  url: string;
  title: string;
}

const ICON_OPTIONS = [
  { id: "Sparkles", label: "✨ عمومی" },
  { id: "ScanLine", label: "لیزر" },
  { id: "Zap", label: "تکار/انرژی" },
  { id: "Activity", label: "طب سوزنی" },
  { id: "Dumbbell", label: "ورزش درمانی" },
  { id: "Stethoscope", label: "معاینه" },
  { id: "HeartPulse", label: "قلبی/توانبخشی" },
  { id: "Waves", label: "هیدروتراپی" },
  { id: "Bone", label: "ارتوپدی" },
  { id: "Brain", label: "اعصاب" },
  { id: "Footprints", label: "گام برداری" },
  { id: "Hand", label: "دست درمانی" },
  { id: "PersonStanding", label: "اصلاح وضعیت" },
];

interface DraftService {
  id?: string;
  name: string;
  short_desc: string;
  description: string;
  image: string | null;
  image_url: string;
  icon: string;
  order: number;
  is_active: boolean;
}

const EMPTY_DRAFT: DraftService = {
  name: "",
  short_desc: "",
  description: "",
  image: null,
  image_url: "",
  icon: "Sparkles",
  order: 0,
  is_active: true,
};

export default function ServicesManager() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<DraftService | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: services, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: () => apiFetch<ManagedService[]>("/site-editor/services/"),
  });

  const { data: assets } = useQuery({
    queryKey: ["admin-media"],
    queryFn: () => apiFetch<MediaAsset[]>("/site-editor/media/"),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-services"] });
    queryClient.invalidateQueries({ queryKey: ["public-services"] });
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const saveMutation = useMutation({
    mutationFn: (d: DraftService) => {
      const body = JSON.stringify({ ...d, image: d.image || null });
      return d.id
        ? apiFetch(`/site-editor/services/${d.id}/`, { method: "PATCH", body })
        : apiFetch("/site-editor/services/", { method: "POST", body });
    },
    onSuccess: () => {
      setDraft(null);
      setError("");
      invalidate();
    },
    onError: (e) => setError(errorMessage((e as { data?: unknown }).data, "خطا در ذخیره خدمت")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/site-editor/services/${id}/`, { method: "DELETE" }),
    onSuccess: invalidate,
    onError: (e) => setError(errorMessage((e as { data?: unknown }).data, "خطا در حذف")),
  });

  const reorderMutation = useMutation({
    mutationFn: ({ a, b }: { a: ManagedService; b: ManagedService }) =>
      Promise.all([
        apiFetch(`/site-editor/services/${a.id}/`, {
          method: "PATCH",
          body: JSON.stringify({ order: b.order }),
        }),
        apiFetch(`/site-editor/services/${b.id}/`, {
          method: "PATCH",
          body: JSON.stringify({ order: a.order }),
        }),
      ]),
    onSuccess: invalidate,
    onError: (e) => setError(errorMessage((e as { data?: unknown }).data, "خطا در جابجایی")),
  });

  const toggleActive = (service: ManagedService) => {
    apiFetch(`/site-editor/services/${service.id}/`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !service.is_active }),
    })
      .then(invalidate)
      .catch((e) => setError(errorMessage(e, "خطا در تغییر وضعیت")));
  };

  // Auto-fill order for new services: last + 1.
  useEffect(() => {
    if (draft && !draft.id && services && services.length > 0) {
      const maxOrder = Math.max(...services.map((s) => s.order ?? 0));
      setDraft((d) => (d && !d.id && d.order === 0 ? { ...d, order: maxOrder + 1 } : d));
    }
  }, [draft, services]);

  const list = services ?? [];

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black">
            <ImagePlus className="h-6 w-6 text-emerald" />
            خدمات کلینیک
          </h1>
          <p className="mt-1 text-sm text-navy/60">
            خدمات در صفحه <b>/services</b> و بخش «خدمات» صفحه اصلی نمایش داده می‌شوند.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDraft({ ...EMPTY_DRAFT })}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald px-5 text-sm font-bold text-white shadow-md transition-colors hover:bg-emerald-light"
        >
          <Plus className="h-4 w-4" />
          خدمت جدید
        </button>
      </div>

      {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
      {saved && (
        <p className="mt-4 flex items-center gap-1.5 text-sm font-bold text-emerald">
          <Check className="h-4 w-4" /> انجام شد
        </p>
      )}

      {/* Editor form */}
      {draft && (
        <section className="mt-5 rounded-2xl border-2 border-emerald/30 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{draft.id ? "ویرایش خدمت" : "خدمت جدید"}</h2>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-navy/50 hover:bg-navy/5"
              aria-label="بستن فرم"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>نام خدمت *</label>
              <input
                className={inputCls}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="مثلاً: ماساژ درمانی"
              />
            </div>
            <div>
              <label className={labelCls}>توضیح کوتاه (روی کارت)</label>
              <input
                className={inputCls}
                value={draft.short_desc}
                onChange={(e) => setDraft({ ...draft, short_desc: e.target.value })}
                placeholder="یک جمله کوتاه"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>توضیح کامل</label>
              <textarea
                rows={4}
                className={inputCls}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="توضیح کامل خدمت برای صفحه /services"
              />
            </div>
            <div>
              <label className={labelCls}>آیکون (وقتی تصویر نیست)</label>
              <select
                className={inputCls}
                value={draft.icon}
                onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
              >
                {ICON_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>ترتیب نمایش</label>
              <input
                type="number"
                className={inputCls}
                value={draft.order}
                onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>تصویر خدمت</label>
              <div className="flex items-center gap-3">
                {draft.image && assets ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={assets.find((a) => a.id === draft.image)?.url ?? ""}
                    alt="تصویر خدمت"
                    className="h-16 w-24 rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex h-16 w-24 items-center justify-center rounded-xl bg-navy/5 text-xs text-navy/40">
                    بدون تصویر
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setPickerOpen((v) => !v)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-emerald/40 px-4 text-sm font-bold text-emerald hover:bg-emerald/5"
                >
                  <ImagePlus className="h-4 w-4" />
                  انتخاب از کتابخانه
                </button>
                {draft.image && (
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, image: null })}
                    className="text-sm font-bold text-red-500 hover:underline"
                  >
                    حذف تصویر
                  </button>
                )}
              </div>
              {pickerOpen && (
                <div className="mt-3 grid max-h-52 grid-cols-4 gap-2 overflow-y-auto rounded-xl border border-navy/10 bg-cream p-2 sm:grid-cols-6">
                  {(assets ?? []).map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        setDraft({ ...draft, image: asset.id });
                        setPickerOpen(false);
                      }}
                      className={`overflow-hidden rounded-lg border-2 transition-all ${
                        draft.image === asset.id ? "border-emerald" : "border-transparent hover:border-navy/30"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset.url} alt={asset.title} className="aspect-square w-full object-cover" />
                    </button>
                  ))}
                  {(assets ?? []).length === 0 && (
                    <p className="col-span-4 py-4 text-center text-xs text-navy/40 sm:col-span-6">
                      کتابخانه خالی است — اول از تب «رسانه‌ها» تصویر آپلود کن.
                    </p>
                  )}
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm font-bold text-navy/80">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                className="h-5 w-5 accent-emerald"
              />
              فعال (در سایت نمایش داده شود)
            </label>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => {
                if (!draft.name.trim()) {
                  setError("نام خدمت الزامی است");
                  return;
                }
                saveMutation.mutate(draft);
              }}
              disabled={saveMutation.isPending}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald px-6 text-sm font-bold text-white shadow-md hover:bg-emerald-light disabled:opacity-60"
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              ذخیره خدمت
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="inline-flex min-h-11 items-center rounded-xl border border-navy/15 px-5 text-sm font-bold text-navy/70 hover:bg-navy/5"
            >
              انصراف
            </button>
          </div>
        </section>
      )}

      {/* List */}
      {isLoading ? (
        <p className="py-10 text-center text-navy/50">در حال بارگذاری...</p>
      ) : (
        <div className="mt-6 space-y-3">
          {list.length === 0 && (
            <p className="rounded-2xl border border-dashed border-navy/20 py-10 text-center text-sm text-navy/40">
              هنوز خدمتی ثبت نشده — با دکمه «خدمت جدید» شروع کن.
            </p>
          )}
          {list.map((service, index) => (
            <div
              key={service.id}
              className="flex items-center gap-3 rounded-2xl border border-navy/10 bg-white p-3 shadow-sm"
            >
              {service.image_src ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={service.image_src} alt={service.name} className="h-14 w-20 shrink-0 rounded-xl object-cover" />
              ) : (
                <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                  <ImagePlus className="h-5 w-5" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className={`truncate font-bold ${service.is_active ? "" : "text-navy/40 line-through"}`}>
                  {service.name}
                </p>
                <p className="truncate text-xs text-navy/50">{service.short_desc || "—"}</p>
              </div>
              <span className="shrink-0 rounded-lg bg-navy/5 px-2 py-1 text-xs font-bold text-navy/50">
                #{service.order}
              </span>
              <button
                type="button"
                onClick={() => toggleActive(service)}
                title={service.is_active ? "غیرفعال کردن" : "فعال کردن"}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-navy/15 text-navy/60 hover:bg-navy/5"
              >
                {service.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    id: service.id,
                    name: service.name,
                    short_desc: service.short_desc,
                    description: service.description,
                    image: null,
                    image_url: "",
                    icon: service.icon || "Sparkles",
                    order: service.order,
                    is_active: service.is_active,
                  })
                }
                title="ویرایش"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-navy/15 text-navy/60 hover:bg-navy/5"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`حذف «${service.name}»؟`)) deleteMutation.mutate(service.id);
                }}
                title="حذف"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => reorderMutation.mutate({ a: list[index - 1], b: service })}
                  title="بالا"
                  className="inline-flex h-6 w-10 items-center justify-center rounded-md border border-navy/10 text-navy/50 hover:bg-navy/5 disabled:opacity-30"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={index === list.length - 1}
                  onClick={() => reorderMutation.mutate({ a: service, b: list[index + 1] })}
                  title="پایین"
                  className="inline-flex h-6 w-10 items-center justify-center rounded-md border border-navy/10 text-navy/50 hover:bg-navy/5 disabled:opacity-30"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
