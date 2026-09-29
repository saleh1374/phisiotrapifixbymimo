"use client";

/**
 * Theme engine — client-side defaults, presets and CSS-variable mapping.
 * The server (siteconfig) stores the saved theme; these are fallbacks.
 */

export interface SiteTheme {
  preset: string;
  primary: string;
  primary_light: string;
  primary_dark: string;
  accent: string;
  accent_light: string;
  navy: string;
  navy_light: string;
  navy_dark: string;
  cream: string;
  heading_font: string;
  body_font: string;
  heading_weight: string;
  radius: string;
}

export const DEFAULT_THEME: SiteTheme = {
  preset: "blue",
  primary: "#2d6a4f",
  primary_light: "#3f8a68",
  primary_dark: "#256044",
  accent: "#d4a373",
  accent_light: "#e6c39a",
  navy: "#1b2a4a",
  navy_light: "#2c3f66",
  navy_dark: "#131f38",
  cream: "#faf7f2",
  heading_font: "Vazirmatn",
  body_font: "Vazirmatn",
  heading_weight: "800",
  radius: "16",
};

export interface ThemePreset {
  id: string;
  label: string;
  theme: Omit<SiteTheme, "preset" | "heading_font" | "body_font" | "heading_weight" | "radius">;
}

/** One-click palettes — آبی/سبز/نارنجی/بنفش/فیروزه‌ای/صورتی */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "blue",
    label: "آبی",
    theme: {
      primary: "#2563eb",
      primary_light: "#3b82f6",
      primary_dark: "#1d4ed8",
      accent: "#f59e0b",
      accent_light: "#fbbf24",
      navy: "#0f2447",
      navy_light: "#1e3a6e",
      navy_dark: "#0a1830",
      cream: "#f5f8ff",
    },
  },
  {
    id: "green",
    label: "سبز",
    theme: {
      primary: "#2d6a4f",
      primary_light: "#3f8a68",
      primary_dark: "#256044",
      accent: "#d4a373",
      accent_light: "#e6c39a",
      navy: "#1b2a4a",
      navy_light: "#2c3f66",
      navy_dark: "#131f38",
      cream: "#faf7f2",
    },
  },
  {
    id: "orange",
    label: "نارنجی",
    theme: {
      primary: "#ea580c",
      primary_light: "#fb7c3c",
      primary_dark: "#c2410c",
      accent: "#0d9488",
      accent_light: "#2dd4bf",
      navy: "#292018",
      navy_light: "#443528",
      navy_dark: "#1a130d",
      cream: "#fffaf5",
    },
  },
  {
    id: "purple",
    label: "بنفش",
    theme: {
      primary: "#7c3aed",
      primary_light: "#8b5cf6",
      primary_dark: "#6d28d9",
      accent: "#eab308",
      accent_light: "#facc15",
      navy: "#221833",
      navy_light: "#372851",
      navy_dark: "#150d20",
      cream: "#fbf7ff",
    },
  },
  {
    id: "teal",
    label: "فیروزه‌ای",
    theme: {
      primary: "#0d9488",
      primary_light: "#14b8a6",
      primary_dark: "#0f766e",
      accent: "#f43f5e",
      accent_light: "#fb7185",
      navy: "#0f2e33",
      navy_light: "#1d4a50",
      navy_dark: "#08191c",
      cream: "#f2fbfa",
    },
  },
  {
    id: "rose",
    label: "صورتی",
    theme: {
      primary: "#e11d48",
      primary_light: "#f43f5e",
      primary_dark: "#be123c",
      accent: "#0891b2",
      accent_light: "#22d3ee",
      navy: "#33101d",
      navy_light: "#521a30",
      navy_dark: "#1e0a12",
      cream: "#fff5f7",
    },
  },
];

/**
 * Fonts bundled with the frontend (self-hosted, no external requests).
 * Every entry is verified to cover the Persian-specific letters پ چ ژ گ ی ک
 * plus Persian digits — fonts that failed the check are NOT included.
 */
export const FONT_OPTIONS = [
  { id: "Vazirmatn", label: "وزیرمتن", tag: "مدرن و خوانا (پیش‌فرض)" },
  { id: "Estedad", label: "استعداد", tag: "مدرن، مشهور و پرکاربرد" },
  { id: "Noto Sans Arabic", label: "نوتو سنس", tag: "ساده و بین‌المللی" },
  { id: "IBM Plex Sans Arabic", label: "آی‌بی‌ام پلکس", tag: "تکنیکال و تمیز" },
  { id: "Cairo", label: "قاهره", tag: "گرد و دوستانه" },
  { id: "Almarai", label: "المرعی", tag: "مینیمال و سبک" },
  { id: "Mada", label: "مداء", tag: "هندسی و مدرن" },
  { id: "Changa", label: "چنگا", tag: "فشرده و پرقدرت" },
  { id: "Readex Pro", label: "ریدکس پرو", tag: "خوانایی بالا" },
  { id: "El Messiri", label: "المسیری", tag: "ظریف و هنری" },
  { id: "Rubik", label: "روبیک", tag: "گرد و جمع‌وجور" },
  { id: "Tajawal", label: "تجوال", tag: "ساده و روزمره" },
  { id: "Markazi Text", label: "مرکزی", tag: "کلاسیک مطبوعاتی" },
  { id: "Amiri", label: "امیری", tag: "نسخ سنتی و کتابی" },
  { id: "Scheherazade New", label: "شهرزاد", tag: "متن‌محور و ادبی" },
  { id: "Noto Naskh Arabic", label: "نسخ نوتو", tag: "کتابخوانی استاندارد" },
  { id: "Lalezar", label: "لاله‌زار", tag: "تیترهای پوست‌ و استخوان‌دار" },
  { id: "Gulzar", label: "گلزار", tag: "نستعلیق فارسی" },
  { id: "Noto Nastaliq Urdu", label: "نستعلیق نوتو", tag: "خوشنویسی کلاسیک" },
] as const;

export const FONT_IDS = FONT_OPTIONS.map((f) => f.id);

export const HEADING_WEIGHTS = [
  { id: "600", label: "نیمه‌ضخیم (600)" },
  { id: "700", label: "ضخیم (700)" },
  { id: "800", label: "خیلی ضخیم (800)" },
  { id: "900", label: "سیاه (900)" },
];

/** CSS custom properties written onto :root by the ThemeProvider. */
export function themeToCssVars(theme: SiteTheme): Record<string, string> {
  return {
    "--color-emerald": theme.primary,
    "--color-emerald-light": theme.primary_light,
    "--color-emerald-dark": theme.primary_dark,
    "--color-gold": theme.accent,
    "--color-gold-light": theme.accent_light,
    "--color-navy": theme.navy,
    "--color-navy-light": theme.navy_light,
    "--color-navy-dark": theme.navy_dark,
    "--color-cream": theme.cream,
    "--font-heading": fontStack(theme.heading_font),
    "--font-body": fontStack(theme.body_font),
    "--heading-weight": theme.heading_weight,
    "--radius-base": `${theme.radius}px`,
  };
}

export function fontStack(id: string): string {
  const found = FONT_OPTIONS.find((f) => f.id === id);
  return found ? `'${found.id}', ui-sans-serif, system-ui, sans-serif` : `ui-sans-serif, system-ui, sans-serif`;
}

/** Merge partial theme data over defaults, ignoring unknown keys. */
export function mergeTheme(raw: unknown): SiteTheme {
  const out: SiteTheme = { ...DEFAULT_THEME };
  if (raw && typeof raw === "object") {
    for (const key of Object.keys(DEFAULT_THEME) as (keyof SiteTheme)[]) {
      const value = (raw as Record<string, unknown>)[key];
      if (value !== undefined && value !== null && value !== "") {
        (out as unknown as Record<string, unknown>)[key] = value;
      }
    }
  }
  return out;
}

/** Apply a preset id to a theme, keeping fonts/weights. */
export function applyPreset(current: SiteTheme, presetId: string): SiteTheme {
  const preset = THEME_PRESETS.find((p) => p.id === presetId);
  if (!preset) return { ...current, preset: presetId };
  return { ...current, ...preset.theme, preset: presetId };
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function isValidHex(value: string): boolean {
  return HEX_RE.test(value.trim());
}
