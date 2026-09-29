"use client";

/**
 * Editable site content — every block is a flat JSON object stored in the
 * `sitecontent` table (key like "home.hero"). Values may be strings or flat
 * lists of strings; anything missing falls back to the defaults below.
 */

export type ContentValue = string | string[];
export type ContentBlock = Record<string, ContentValue>;

/** Shown in the admin editor as the human title for each block. */
export const CONTENT_SECTIONS: { key: string; title: string; fields: { name: string; label: string; textarea?: boolean; list?: boolean }[] }[] = [
  {
    key: "home.hero",
    title: "صفحه اصلی — بخش معرفی (Hero)",
    fields: [
      { name: "badge", label: "برچسب کوچک بالای عنوان" },
      { name: "title_line1", label: "عنوان (خط اول)" },
      { name: "title_line2", label: "عنوان (خط دوم — رنگی)" },
      { name: "description", label: "توضیح", textarea: true },
      { name: "trust_items", label: "موارد اعتماد (هر خط یک مورد)", textarea: true, list: true },
      { name: "hero_image", label: "آدرس تصویر اصلی (اختیاری — از رسانه کپی کنید)" },
    ],
  },
  {
    key: "home.stats",
    title: "صفحه اصلی — آمار",
    fields: [
      { name: "stats", label: "آمار — هر خط: عدد | برچسب", textarea: true, list: true },
    ],
  },
  {
    key: "home.services",
    title: "صفحه اصلی — خدمات",
    fields: [
      { name: "badge", label: "برچسب بخش" },
      { name: "title", label: "عنوان بخش" },
      { name: "subtitle", label: "زیرعنوان" },
      { name: "services", label: "خدمات — هر خط: نام | توضیح", textarea: true, list: true },
    ],
  },
  {
    key: "home.features",
    title: "صفحه اصلی — ماژول‌های پلتفرم",
    fields: [
      { name: "badge", label: "برچسب بخش" },
      { name: "title", label: "عنوان بخش" },
      { name: "subtitle", label: "زیرعنوان" },
      { name: "items", label: "ماژول‌ها — هر خط: عنوان | توضیح", textarea: true, list: true },
    ],
  },
  {
    key: "home.cta",
    title: "صفحه اصلی — فراخوان پایانی",
    fields: [
      { name: "title", label: "عنوان" },
      { name: "description", label: "توضیح", textarea: true },
      { name: "button_label", label: "متن دکمه" },
    ],
  },
  {
    key: "footer.about",
    title: "فوتر — درباره ما",
    fields: [
      { name: "about_text", label: "متن درباره ما", textarea: true },
    ],
  },
];

export const DEFAULT_CONTENT: Record<string, ContentBlock> = {
  "home.hero": {
    badge: "کلینیک تخصصی فیزیوتراپی و توانبخشی",
    title_line1: "سلامتی شما،",
    title_line2: "اولویت ماست",
    description:
      "رزرو نوبت آنلاین با تقویم شمسی، فیلم‌های آموزشی اختصاصی، دوره‌های تخصصی با گواهی معتبر و جدیدترین اخبار دنیای فیزیوتراپی — همه در یک پلتفرم.",
    trust_items: [
      "کادر مجرب و دارای بورد",
      "پروتکل‌های علمی و استاندارد",
      "برنامه درمان اختصاصی",
      "تجهیزات به‌روز اروپایی",
    ],
  },
  "home.stats": {
    stats: [
      "12+ | سال سابقه",
      "8000+ | بیمار موفق",
      "20+ | پزشک متخصص",
      "95٪ | رضایت بیماران",
    ],
  },
  "home.services": {
    badge: "خدمات تخصصی",
    title: "خدمات کلینیک",
    subtitle: "درمان تخصصی با به‌روزترین تجهیزات و روش‌های علمی روز دنیا",
    services: [
      "لیزرتراپی | لیزر سطح پایین برای تسریع ترمیم بافت",
      "تکارتراپی | انرژی رادیویی برای دردهای مزمن",
      "طب سوزنی | درمان نقاط ماشه‌ای و درد عضلانی",
      "ورزش درمانی | برنامه تمرینی شخصی‌سازی‌شده",
      "معاینه تخصصی | ارزیابی دقیق وضعیت حرکتی",
      "دستگاه‌های مدرن | تجهیزات روز توانبخشی",
    ],
  },
  "home.features": {
    badge: "پلتفرم یکپارچه",
    title: "چهار ماژول اصلی پلتفرم",
    subtitle: "از رزرو نوبت تا آموزش و پیگیری — یک تجربه کامل و یکپارچه",
    items: [
      "رزرو نوبت هوشمند | انتخاب پزشک، تاریخ و ساعت با تقویم شمسی؛ بدون نیاز به تماس تلفنی و با جلوگیری از رزرو همزمان.",
      "فیلم‌های آموزشی اختصاصی | تمرینات تجویز شده توسط پزشک، همراه با پیگیری خودکار پیشرفت شما.",
      "آکادمی تخصصی | دوره‌های آموزشی فیزیوتراپی با گواهی‌نامه معتبر و کد اصالت قابل استعلام.",
      "مجله علمی | جدیدترین تحقیقات و متدهای روز جهان، اسکن و ترجمه شده به فارسی روان.",
    ],
  },
  "home.cta": {
    title: "همین حالا نوبت خود را رزرو کنید",
    description:
      "ثبت‌نام تنها چند ثانیه زمان می‌برد؛ با نام کاربری و رمز عبور یا حساب گوگل وارد شوید و از تمام خدمات استفاده کنید.",
    button_label: "شروع کنید",
  },
  "footer.about": {
    about_text:
      "ارائه‌دهنده خدمات تخصصی فیزیوتراپی، توانبخشی و آموزش‌های تخصصی با کادری مجرب و تجهیزات به‌روز.",
  },
};

/** Merge stored blocks over defaults so new fields always have a value. */
export function mergeContent(stored: Record<string, ContentBlock> | undefined): Record<string, ContentBlock> {
  const out: Record<string, ContentBlock> = {};
  for (const key of Object.keys(DEFAULT_CONTENT)) {
    const storedBlock = stored?.[key];
    const block: ContentBlock = { ...DEFAULT_CONTENT[key] };
    if (storedBlock && typeof storedBlock === "object") {
      for (const [field, value] of Object.entries(storedBlock)) {
        if (value !== undefined && value !== null && value !== "") {
          block[field] = value as ContentValue;
        }
      }
    }
    out[key] = block;
  }
  return out;
}

/** Parse "12+ | سال سابقه" style list entries into pairs. */
export function parsePairList(items: string[] | string | undefined): { left: string; right: string }[] {
  if (!items) return [];
  const list = Array.isArray(items) ? items : String(items).split("\n");
  return list
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [left, ...rest] = line.split("|");
      return { left: (left || "").trim(), right: rest.join("|").trim() };
    });
}
