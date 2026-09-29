"use client";

import { FileText, ImagePlus, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";

import AppearanceEditor from "@/components/admin/AppearanceEditor";
import ContentEditor from "@/components/admin/ContentEditor";
import MediaEditor from "@/components/admin/MediaEditor";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

const TABS = [
  { id: "theme", label: "تم و رنگ‌ها", icon: Palette },
  { id: "media", label: "رسانه‌ها", icon: ImagePlus },
  { id: "content", label: "محتوای صفحات", icon: FileText },
];

export default function AdminAppearancePage() {
  const router = useRouter();
  const { user, accessToken, hasHydrated } = useAuthStore();
  const [tab, setTab] = useState("theme");

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken || !user) router.replace("/login");
    else if (user.role !== "admin") router.replace("/dashboard");
  }, [accessToken, user, hasHydrated, router]);

  if (!user || user.role !== "admin") return null;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-5 text-sm font-bold transition-colors",
              tab === id ? "bg-emerald text-white shadow-md" : "bg-white text-navy/70 hover:bg-navy/5 border border-navy/10"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "theme" && <AppearanceEditor />}
        {tab === "media" && <MediaEditor />}
        {tab === "content" && <ContentEditor />}
      </div>
    </div>
  );
}
