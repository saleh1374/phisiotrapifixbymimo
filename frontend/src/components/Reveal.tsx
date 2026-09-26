"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  /** Delay in ms before the element animates in (stagger effect). */
  delay?: number;
  className?: string;
}

/**
 * Reveals its children with a fade+slide once they enter the viewport.
 * Falls back to visible immediately when IntersectionObserver is missing
 * or the user prefers reduced motion.
 */
export default function Reveal({ children, delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
      className={cn("reveal", visible && "is-visible", className)}
    >
      {children}
    </div>
  );
}
