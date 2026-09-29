"use client";

import { useEffect } from "react";

import { useAppearance } from "@/components/ThemeProvider";

/** Keeps <title> / og tags in sync with the admin-editable site identity. */
export default function BrandingMeta() {
  const { branding, content } = useAppearance();

  useEffect(() => {
    const siteName = content["home.hero"]?.title_line1
      ? undefined
      : undefined; // Title template already handled by Next metadata.
    void siteName;

    const og = branding.og_image;
    if (og) {
      let tag = document.querySelector<HTMLMetaElement>("meta[property='og:image']");
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", "og:image");
        document.head.appendChild(tag);
      }
      tag.content = new URL(og, window.location.origin).toString();
    }
  }, [branding, content]);

  return null;
}
