"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo } from "react";

import { apiFetch } from "@/lib/api";
import { mergeContent, type ContentBlock } from "@/lib/siteContent";
import { mergeTheme, themeToCssVars, type SiteTheme } from "@/lib/theme";

export interface Branding {
  logo: string;
  logo_alt_text?: string;
  favicon?: string;
  og_image?: string;
}

interface SiteAppearance {
  theme: SiteTheme;
  branding: Branding;
  content: Record<string, ContentBlock>;
}

interface AppearanceContextValue extends SiteAppearance {
  /** Invalidate the cached appearance (used after saving in the admin). */
  refresh: () => void;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

/** Cached default so the very first paint has the current palette. */
const FALLBACK: SiteAppearance = {
  theme: mergeTheme(undefined),
  branding: { logo: "", logo_alt_text: "", favicon: "", og_image: "" },
  content: mergeContent(undefined),
};

function applyThemeVars(theme: SiteTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const vars = themeToCssVars(theme);
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

function applyFavicon(favicon: string) {
  if (typeof document === "undefined" || !favicon) return;
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = favicon;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: themeData } = useQuery({
    queryKey: ["public-theme"],
    queryFn: () => apiFetch<Record<string, unknown>>("/site-editor/public/theme/", {}, false),
    staleTime: 5 * 60_000,
  });

  const { data: brandingData } = useQuery({
    queryKey: ["public-branding"],
    queryFn: () => apiFetch<Branding>("/site-editor/public/branding/", {}, false),
    staleTime: 5 * 60_000,
  });

  const { data: contentData } = useQuery({
    queryKey: ["public-content"],
    queryFn: () => apiFetch<Record<string, ContentBlock>>("/site-editor/public/content/", {}, false),
    staleTime: 5 * 60_000,
  });

  const value = useMemo<AppearanceContextValue>(
    () => ({
      theme: mergeTheme(themeData),
      branding: brandingData ?? FALLBACK.branding,
      content: mergeContent(contentData),
      refresh: () => {
        queryClient.invalidateQueries({ queryKey: ["public-theme"] });
        queryClient.invalidateQueries({ queryKey: ["public-branding"] });
        queryClient.invalidateQueries({ queryKey: ["public-content"] });
      },
    }),
    [themeData, brandingData, contentData, queryClient]
  );

  // Inject CSS variables + favicon whenever the theme/branding changes.
  useEffect(() => {
    applyThemeVars(value.theme);
    applyFavicon(value.branding.favicon ?? "");
  }, [value.theme, value.branding]);

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

/** Access the site-wide appearance (theme, branding, editable content). */
export function useAppearance(): AppearanceContextValue {
  const ctx = useContext(AppearanceContext);
  if (!ctx) return { ...FALLBACK, refresh: () => {} };
  return ctx;
}
