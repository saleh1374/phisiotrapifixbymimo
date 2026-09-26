"use client";

import { useEffect, useRef, useState } from "react";

import { faNum } from "@/lib/utils";

interface Props {
  /** Final number shown (e.g. 12, 8000, 95). */
  value: number;
  /** Optional display suffix/prefix like "+" or "٪". */
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

/**
 * Counts up from 0 to `value` when scrolled into view.
 * Respects prefers-reduced-motion by rendering the final value directly.
 */
export default function CountUp({
  value,
  prefix = "",
  suffix = "",
  durationMs = 1400,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / durationMs, 1);
      // easeOutCubic for a natural deceleration.
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {faNum(prefix + display + suffix)}
    </span>
  );
}
