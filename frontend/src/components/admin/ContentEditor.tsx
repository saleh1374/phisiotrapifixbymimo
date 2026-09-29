"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, FileText, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { apiFetch, errorMessage } from "@/lib/api";
import { CONTENT_SECTIONS, DEFAULT_CONTENT, type ContentBlock } from "@/lib/siteContent";
import { inputCls, labelCls } from "@/lib/admin";

/** Split "نام | توضیح" into its two parts. */
function splitPair(line: string): [string, string] {
  const idx = line.indexOf("|");
  if (idx === -1) return [line.trim(), ""];
  return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
}

function joinPair(left: string, right: string): string {
  return right ? `${left} | ${right}` : left;
}

/** A sortable list editor: every row = "نام | توضیح" with add/remove. */
function ListFieldEditor({
  value,
  onChange,
  addLabel,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  addLabel: string;
}) {
  const rows = value.length > 0 ? value : [""];

  const updateRow = (index: number, left: string, right: string) => {
    const next = [...rows];
    next[index] = joinPair(left, right);
    onChange(next);
  };

  const removeRow = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    onChange(next);
  };

  const addRow = () => onChange([...rows, ""]);

  return (
    <div className="space-y-2">
      {rows.map((line, index) => {
        const [left, right] = splitPair(line);
        return (
          <div key={index} className="flex items-start gap-2">
            <span className="mt-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy/5 text-xs font-bold text-navy/60">
              {index + 1}
            </span>
            <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_1.4fr]">
              <input
                className={inputCls}
                value={left}
                placeholder="نام / عنوان"
                onChange={(e) => updateRow(index, e.target.value, right)}
              />
              <input
                className={inputCls}
                value={right}
                placeholder="توضیح (اختیاری)"
                onChange={(e) => updateRow(index, left, e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-500 transition-colors hover:bg-red-50"
              title="حذف این ردیف"
              aria-label="حذف این ردیف"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={addRow}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-dashed border-emerald/50 px-4 text-sm font-bold text-emerald transition-colors hover:bg-emerald/5"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}

export default function ContentEditor() {
  const queryClient = useQueryClient();
  const [blocks, setBlocks] = useState<Record<string, ContentBlock> | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const { data } = useQuery({
    queryKey: ["public-content"],
    queryFn: () => apiFetch<Record<string, ContentBlock>>("/site-editor/public/content/", {}, false),
  });

  useEffect(() => {
    // Seed the form with defaults overlaid by whatever is stored.
    const merged: Record<string, ContentBlock> = {};
    for (const section of CONTENT_SECTIONS) {
      merged[section.key] = { ...DEFAULT_CONTENT[section.key], ...(data?.[section.key] ?? {}) };
    }
    setBlocks(merged);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const items = CONTENT_SECTIONS.map((s) => ({ key: s.key, data: blocks?.[s.key] ?? {} }));
      return apiFetch("/site-editor/content/", { method: "PUT", body: JSON.stringify(items) });
    },
    onSuccess: () => {
      setSaved(true);
      setError("");
      queryClient.invalidateQueries({ queryKey: ["public-content"] });
      setTimeout(() => setSaved(false), 4000);
    },
    onError: (e) => setError(errorMessage((e as { data?: unknown }).data, "خطا در ذخیره محتوا")),
  });

  if (!blocks) {
    return <p className="py-10 text-center text-navy/50">در حال بارگذاری محتوا...</p>;
  }

  const setField = (key: string, field: string, value: string | string[]) => {
    setBlocks((prev) => {
      if (!prev) return prev;
      const section = { ...prev[key] };
      section[field] = value;
      return { ...prev, [key]: section };
    });
  };

  const getLines = (key: string, field: string): string[] => {
    const value = blocks[key]?.[field];
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.trim()) return value.split("\n");
    return [];
  };

  return (
    <div className="max-w-4xl">
      <h1 className="flex items-center gap-2 text-2xl font-black">
        <FileText className="h-6 w-6 text-emerald" />
        محتوای سایت
      </h1>
      <p className="mt-1 text-sm text-navy/60">
        متن‌های صفحه اصلی و فوتر را همین‌جا ویرایش کن — برای لیست‌ها (خدمات و ...) ردیف اضافه یا حذف کن.
      </p>

      {CONTENT_SECTIONS.map((section) => (
        <section key={section.key} className="mt-6 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <h2 className="font-bold">{section.title}</h2>
          <div className="mt-4 grid gap-4">
            {section.fields.map((field) => {
              const value = blocks[section.key]?.[field.name];
              if (field.list) {
                return (
                  <div key={field.name}>
                    <label className={labelCls}>{field.label}</label>
                    <ListFieldEditor
                      value={getLines(section.key, field.name)}
                      onChange={(next) => setField(section.key, field.name, next)}
                      addLabel={`افزودن ${section.key === "home.services" ? "خدمت جدید" : "آیتم جدید"}`}
                    />
                  </div>
                );
              }
              const textValue = Array.isArray(value) ? value.join("\n") : value ?? "";
              return (
                <div key={field.name}>
                  <label className={labelCls}>{field.label}</label>
                  {field.textarea ? (
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={textValue}
                      onChange={(e) => setField(section.key, field.name, e.target.value)}
                    />
                  ) : (
                    <input
                      className={inputCls}
                      value={textValue}
                      onChange={(e) => setField(section.key, field.name, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald px-6 text-sm font-bold text-white shadow-md transition-colors hover:bg-emerald-light disabled:opacity-60"
        >
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          ذخیره محتوا
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
