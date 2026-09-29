"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { apiFetch, errorMessage } from "@/lib/api";

interface Branding {
  logo: string;
  logo_alt_text: string;
  favicon: string;
  og_image: string;
}

interface MediaAsset {
  id: string;
  url: string;
  title: string;
  uploaded_at: string;
}

const BRAND_FIELDS: { field: "logo" | "favicon" | "og_image"; label: string; hint: string }[] = [
  { field: "logo", label: "لوگوی سایت", hint: "در هدر و فوتر جای علامت «ف» می‌نشیند" },
  { field: "favicon", label: "فاوآیکون", hint: "آیکون کنار آدرس سایت در مرورگر" },
  { field: "og_image", label: "تصویر اشتراک‌گذاری", hint: "هنگام ارسال لینک در شبکه‌های اجتماعی نمایش داده می‌شود" },
];

export default function MediaEditor() {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const ogInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const { data: branding } = useQuery({
    queryKey: ["admin-branding"],
    queryFn: () => apiFetch<Branding>("/site-editor/public/branding/", {}, false),
  });

  const { data: assets } = useQuery({
    queryKey: ["admin-media"],
    queryFn: () => apiFetch<MediaAsset[]>("/site-editor/media/"),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-branding"] });
    queryClient.invalidateQueries({ queryKey: ["public-branding"] });
    queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  const uploadBranding = useMutation({
    mutationFn: ({ field, file }: { field: string; file: File }) => {
      const form = new FormData();
      form.append("field", field);
      form.append("image", file);
      return apiFetch("/site-editor/branding/", { method: "POST", body: form });
    },
    onSuccess: () => {
      setError("");
      invalidate();
    },
    onError: (e) => setError(errorMessage((e as { data?: unknown }).data, "خطا در آپلود تصویر")),
  });

  const deleteBranding = useMutation({
    mutationFn: (field: string) =>
      apiFetch("/site-editor/branding/", { method: "DELETE", body: JSON.stringify({ field }) }),
    onSuccess: () => {
      setError("");
      invalidate();
    },
    onError: (e) => setError(errorMessage((e as { data?: unknown }).data, "خطا در حذف تصویر")),
  });

  const uploadLibrary = useMutation({
    mutationFn: (files: FileList) => {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("images", f));
      return apiFetch("/site-editor/media/", { method: "POST", body: form });
    },
    onSuccess: () => {
      setError("");
      invalidate();
    },
    onError: (e) => setError(errorMessage((e as { data?: unknown }).data, "خطا در آپلود")),
  });

  const deleteAsset = useMutation({
    mutationFn: (id: string) => apiFetch(`/site-editor/media/${id}/`, { method: "DELETE" }),
    onSuccess: invalidate,
    onError: (e) => setError(errorMessage((e as { data?: unknown }).data, "خطا در حذف")),
  });

  const fieldRef = { logo: logoInputRef, favicon: faviconInputRef, og_image: ogInputRef };

  return (
    <div className="max-w-4xl">
      <h1 className="flex items-center gap-2 text-2xl font-black">
        <ImagePlus className="h-6 w-6 text-emerald" />
        رسانه‌ها
      </h1>
      <p className="mt-1 text-sm text-navy/60">
        لوگو و تصاویر سایت را از اینجا عوض کن — فرمت‌های JPG، PNG، WebP تا ۵ مگابایت.
      </p>

      {/* Branding */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {BRAND_FIELDS.map(({ field, label, hint }) => {
          const current = branding?.[field] as string | undefined;
          return (
            <div key={field} className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
              <h2 className="font-bold">{label}</h2>
              <p className="mt-1 text-xs text-navy/50">{hint}</p>
              <div className="mt-3 flex h-28 items-center justify-center rounded-xl bg-navy/5">
                {current ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={current} alt={label} className="max-h-24 max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-navy/40">هنوز تصویری انتخاب نشده</span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fieldRef[field].current?.click()}
                  disabled={uploadBranding.isPending}
                  className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald px-3 text-xs font-bold text-white hover:bg-emerald-light disabled:opacity-60"
                >
                  {uploadBranding.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {current ? "تعویض" : "آپلود"}
                </button>
                {current && (
                  <button
                    type="button"
                    onClick={() => deleteBranding.mutate(field)}
                    disabled={deleteBranding.isPending}
                    className="inline-flex min-h-9 items-center justify-center rounded-lg border border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-50"
                    aria-label={`حذف ${label}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <input
                ref={fieldRef[field]}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadBranding.mutate({ field, file });
                  e.target.value = "";
                }}
              />
            </div>
          );
        })}
      </section>

      {/* Library */}
      <section className="mt-6 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-bold">کتابخانه تصاویر</h2>
            <p className="mt-1 text-xs text-navy/50">
              تصاویر عمومی سایت؛ هر تصویری آپلود کنی می‌توانی آدرسش را در بخش «محتوا» استفاده کنی.
            </p>
          </div>
          <button
            type="button"
            onClick={() => libraryInputRef.current?.click()}
            disabled={uploadLibrary.isPending}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-emerald/40 px-4 text-sm font-bold text-emerald hover:bg-emerald/5 disabled:opacity-60"
          >
            {uploadLibrary.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            آپلود تصاویر
          </button>
          <input
            ref={libraryInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) uploadLibrary.mutate(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {assets && assets.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {assets.map((asset) => (
              <div key={asset.id} className="group relative overflow-hidden rounded-xl border border-navy/10 bg-navy/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.url} alt={asset.title} className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  onClick={() => deleteAsset.mutate(asset.id)}
                  className="absolute left-1.5 top-1.5 rounded-lg bg-white/90 p-1.5 text-red-600 opacity-0 shadow transition-opacity group-hover:opacity-100"
                  aria-label="حذف تصویر"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(asset.url)}
                  className="absolute bottom-1.5 right-1.5 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-navy opacity-0 shadow transition-opacity group-hover:opacity-100"
                  title="کپی آدرس تصویر"
                >
                  کپی آدرس
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-center text-sm text-navy/40">کتابخانه خالی است</p>
        )}
      </section>

      <div className="mt-4 flex items-center gap-4">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-bold text-emerald">
            <Check className="h-4 w-4" />
            انجام شد
          </span>
        )}
        {error && <span className="text-sm font-bold text-red-600">{error}</span>}
      </div>
    </div>
  );
}
