"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Palette, RotateCcw, Save, Type } from "lucide-react";
import { useEffect, useState } from "react";

import { apiFetch, errorMessage } from "@/lib/api";
import {
  applyPreset,
  FONT_OPTIONS,
  HEADING_WEIGHTS,
  isValidHex,
  mergeTheme,
  themeToCssVars,
  THEME_PRESETS,
  type SiteTheme,
} from "@/lib/theme";
import { inputCls, labelCls } from "@/lib/admin";

const COLOR_FIELDS: { name: keyof SiteTheme; label: string }[] = [
  { name: "primary", label: "رنگ اصلی (دکمه‌ها، تاکیدها)" },
  { name: "primary_light", label: "رنگ اصلی — روشن" },
  { name: "primary_dark", label: "رنگ اصلی — تیره" },
  { name: "accent", label: "رنگ مکمل (تزئینی)" },
  { name: "accent_light", label: "رنگ مکمل — روشن" },
  { name: "navy", label: "رنگ متن / تیره" },
  { name: "navy_light", label: "تیره — روشن‌تر" },
  { name: "navy_dark", label: "تیره — تیره‌تر (هدر)" },
  { name: "cream", label: "پس‌زمینه ملایم" },
];

export default function AppearanceEditor() {
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState<SiteTheme | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Load current theme (falls back to defaults before fetch completes).
  useEffect(() => {
    let cancelled = false;
    apiFetch<Record<string, unknown>>("/site-editor/theme/")
      .then((data) => {
        if (!cancelled) setTheme(mergeTheme(data));
      })
      .catch(() => {
        if (!cancelled) setTheme(mergeTheme(undefined));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Live preview: apply working theme to the page while editing.
  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(themeToCssVars(theme))) {
      root.style.setProperty(key, value);
    }
  }, [theme]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiFetch("/site-editor/theme/", { method: "PUT", body: JSON.stringify(theme) }),
    onSuccess: () => {
      setSaved(true);
      setError("");
      queryClient.invalidateQueries({ queryKey: ["public-theme"] });
      setTimeout(() => setSaved(false), 4000);
    },
    onError: (e) => setError(errorMessage((e as { data?: unknown }).data, "خطا در ذخیره تم")),
  });

  if (!theme) {
    return <p className="py-10 text-center text-navy/50">در حال بارگذاری تم...</p>;
  }

  const set = (key: keyof SiteTheme, value: string) => setTheme({ ...theme, [key]: value });

  const handleSave = () => {
    // Validate hex colors before sending.
    for (const { name } of COLOR_FIELDS) {
      const value = theme[name] as string;
      if (!isValidHex(value)) {
        setError(`رنگ «${name}» نامعتبر است — فرمت درست مثل ‎#22c55e`);
        return;
      }
    }
    saveMutation.mutate();
  };

  return (
    <div className="max-w-4xl">
      <h1 className="flex items-center gap-2 text-2xl font-black">
        <Palette className="h-6 w-6 text-emerald" />
        ظاهر سایت
      </h1>
      <p className="mt-1 text-sm text-navy/60">
        تم رنگی، فونت و گردی گوشه‌ها را همین‌جا عوض کن — تغییرات قبل از ذخیره، زنده روی همین صفحه اعمال می‌شوند.
      </p>

      {/* Presets */}
      <section className="mt-6 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <h2 className="font-bold">تم‌های آماده</h2>
        <p className="mt-1 text-xs text-navy/50">با یک کلیک کل رنگ‌بندی سایت عوض می‌شود؛ بعداً می‌توانی جزئیات را دستی تغییر دهی.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setTheme({ ...applyPreset(theme, preset.id) })}
              className={`group relative rounded-2xl border-2 p-3 text-center transition-all hover:-translate-y-0.5 ${
                theme.preset === preset.id
                  ? "border-emerald bg-emerald/5 shadow-md"
                  : "border-navy/10 bg-white hover:border-navy/30"
              }`}
            >
              <div className="mx-auto flex h-10 w-full max-w-[120px] overflow-hidden rounded-lg">
                <span className="h-full flex-1" style={{ background: preset.theme.primary }} />
                <span className="h-full flex-1" style={{ background: preset.theme.primary_light }} />
                <span className="h-full flex-1" style={{ background: preset.theme.accent }} />
                <span className="h-full flex-1" style={{ background: preset.theme.navy }} />
              </div>
              <p className="mt-2 text-sm font-bold">{preset.label}</p>
              {theme.preset === preset.id && (
                <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Colors */}
      <section className="mt-5 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <h2 className="font-bold">رنگ‌های اختصاصی</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_FIELDS.map(({ name, label }) => (
            <div key={name}>
              <label className={labelCls}>{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={isValidHex(theme[name] as string) ? (theme[name] as string) : "#000000"}
                  onChange={(e) => set(name, e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-navy/20 bg-white p-1"
                  aria-label={label}
                />
                <input
                  dir="ltr"
                  className={inputCls}
                  value={theme[name] as string}
                  onChange={(e) => set(name, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fonts */}
      <section className="mt-5 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-bold">
          <Type className="h-5 w-5 text-emerald" />
          فونت‌ها
          <span className="rounded-full bg-emerald/10 px-2.5 py-0.5 text-xs font-bold text-emerald">
            {FONT_OPTIONS.length} فونت
          </span>
        </h2>
        <p className="mt-1 text-xs text-navy/50">
          همه فونت‌ها روی خود سایت ذخیره شده‌اند (بدون نیاز به اینترنت) و همگی از حروف فارسی پشتیبانی می‌کنند.
          با کلیک روی هر کارت، به‌عنوان فونت کل سایت انتخاب می‌شود.
        </p>
        <div className="mt-4 grid max-h-[420px] grid-cols-2 gap-3 overflow-y-auto pl-1 sm:grid-cols-3 lg:grid-cols-4">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() => setTheme({ ...theme, heading_font: font.id, body_font: font.id })}
              className={`rounded-2xl border-2 p-3 text-right transition-all hover:-translate-y-0.5 ${
                theme.heading_font === font.id && theme.body_font === font.id
                  ? "border-emerald bg-emerald/5 shadow-md"
                  : "border-navy/10 bg-white hover:border-navy/30"
              }`}
            >
              <p
                className="truncate text-xl font-bold leading-8"
                style={{ fontFamily: `'${font.id}', sans-serif` }}
                title="فیزیوتراپی ۱۲۳"
              >
                فیزیوتراپی ۱۲۳
              </p>
              <p className="mt-1.5 text-sm font-bold">{font.label}</p>
              <p className="mt-0.5 text-[11px] leading-4 text-navy/50">{font.tag}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>فونت تیترها</label>
            <select className={inputCls} value={theme.heading_font} onChange={(e) => set("heading_font", e.target.value)}>
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>فونت متن</label>
            <select className={inputCls} value={theme.body_font} onChange={(e) => set("body_font", e.target.value)}>
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>ضخامت تیترها</label>
            <select className={inputCls} value={theme.heading_weight} onChange={(e) => set("heading_weight", e.target.value)}>
              {HEADING_WEIGHTS.map((w) => (
                <option key={w.id} value={w.id}>{w.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Radius */}
      <section className="mt-5 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <h2 className="font-bold">گردی گوشه‌ها</h2>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={40}
            value={Number(theme.radius)}
            onChange={(e) => set("radius", e.target.value)}
            className="h-2 w-64 accent-emerald"
          />
          <span className="w-16 rounded-lg bg-navy/5 px-2 py-1 text-center text-sm font-bold">{theme.radius}px</span>
          <button
            type="button"
            onClick={() => setTheme(mergeTheme(undefined))}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy/60 hover:text-navy"
          >
            <RotateCcw className="h-4 w-4" />
            بازگشت به پیش‌فرض
          </button>
        </div>
      </section>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald px-6 text-sm font-bold text-white shadow-md transition-colors hover:bg-emerald-light disabled:opacity-60"
        >
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          ذخیره و اعمال روی سایت
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-bold text-emerald">
            <Check className="h-4 w-4" />
            ذخیره شد — سایت به‌روز شد
          </span>
        )}
        {error && <span className="text-sm font-bold text-red-600">{error}</span>}
      </div>
    </div>
  );
}
