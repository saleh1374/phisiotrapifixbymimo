"use client";

import { LogOut, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useAuthStore } from "@/stores/auth";
import { useAppearance } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "خانه" },
  { href: "/appointment", label: "رزرو نوبت" },
  { href: "/videos", label: "فیلم‌های آموزشی" },
  { href: "/academy", label: "آکادمی" },
  { href: "/magazine", label: "مجله علمی" },
];

function Logo() {
  const { branding } = useAppearance();
  if (branding.logo) {
    return (
      <Link href="/" className="flex items-center gap-2" title="صفحه اصلی">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={branding.logo}
          alt={branding.logo_alt_text || "لوگو"}
          className="h-11 w-auto max-w-[180px] object-contain"
        />
      </Link>
    );
  }
  return (
    <Link href="/" className="flex items-center gap-2" title="کلینیک فیزیوتراپی">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald text-xl font-black text-white shadow-md">
        ف
      </span>
      <span className="hidden text-lg font-bold sm:block">
        کلینیک <span className="text-emerald">فیزیوتراپی</span>
      </span>
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  const drawer = (
    <div
      className={cn(
        "fixed inset-0 transition-all duration-300 md:hidden",
        menuOpen ? "opacity-100 z-[9999]" : "pointer-events-none opacity-0 z-[-1]"
      )}
      onClick={() => setMenuOpen(false)}
      aria-hidden={!menuOpen}
    >
      <div className={cn(
        "absolute inset-0 bg-black/70 transition-opacity duration-300",
        menuOpen ? "opacity-100" : "opacity-0"
      )} />
      <aside
        className={cn(
          "absolute inset-y-0 right-0 z-10 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out",
          menuOpen ? "translate-x-0" : "translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-navy/10 px-5">
          <Logo />
          <button
            type="button"
            aria-label="بستن منو"
            onClick={() => setMenuOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-navy/60 hover:bg-navy/5 hover:text-navy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="flex flex-col gap-1 p-4">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                title={link.label}
                className={cn(
                  "block rounded-xl px-4 py-3 text-base font-medium transition-colors",
                  pathname === link.href
                    ? "bg-emerald/10 text-emerald font-bold"
                    : "text-navy/80 hover:bg-navy/5 hover:text-navy"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-2 border-t border-navy/10 p-4">
          {user ? (
            <>
              <Link
                href="/profile"
                title="پروفایل من"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-navy/15 px-4 text-sm font-medium text-navy/80 hover:bg-navy/5"
              >
                <User className="h-4 w-4" />
                پروفایل من
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  title="پنل مدیریت"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-navy px-4 text-sm font-bold text-white"
                >
                  پنل مدیریت
                </Link>
              )}
              <Link
                href="/dashboard"
                title="داشبورد من"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald px-4 text-sm font-bold text-white"
              >
                داشبورد من
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-navy/15 px-4 text-sm font-medium text-navy/60 hover:bg-navy/5"
              >
                <LogOut className="h-4 w-4" />
                خروج
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                title="ورود"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-navy/15 px-4 text-sm font-medium text-navy/80"
              >
                ورود
              </Link>
              <Link
                href="/register"
                title="ثبت‌نام"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald px-4 text-sm font-bold text-white"
              >
                ثبت‌نام
              </Link>
            </>
          )}
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-white/90 backdrop-blur transition-all duration-300",
          scrolled ? "border-navy/10 shadow-[0_8px_30px_-12px_rgba(27,42,74,0.18)]" : "border-transparent"
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  title={link.label}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={cn(
                    "relative inline-flex min-h-12 items-center rounded-lg px-4 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "text-emerald"
                      : "text-navy/80 hover:bg-navy/5 hover:text-navy"
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute inset-x-4 bottom-1.5 h-0.5 rounded-full bg-emerald" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    title="پنل مدیریت"
                    className="inline-flex min-h-12 items-center rounded-xl bg-navy px-4 text-sm font-bold text-white transition-colors hover:bg-navy-light"
                  >
                    پنل مدیریت
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  title="داشبورد من"
                  className="inline-flex min-h-12 items-center rounded-xl border border-emerald/30 px-4 text-sm font-semibold text-emerald transition-colors hover:bg-emerald/5"
                >
                  {user.full_name || user.phone_number}
                </Link>
                <Link
                  href="/profile"
                  title="پروفایل من"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-navy/15 text-navy/60 transition-colors hover:bg-navy/5 hover:text-navy"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="خروج"
                  className="inline-flex min-h-12 items-center gap-1.5 rounded-xl border border-navy/15 px-4 text-sm font-medium text-navy/70 transition-colors hover:bg-navy/5"
                >
                  <LogOut className="h-4 w-4" />
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  title="ورود به حساب کاربری"
                  className="inline-flex min-h-12 items-center rounded-xl border border-navy/15 px-4 text-sm font-medium text-navy/80 transition-colors hover:bg-navy/5"
                >
                  ورود
                </Link>
                <Link
                  href="/register"
                  title="ثبت‌نام"
                  className="inline-flex min-h-12 items-center rounded-xl bg-emerald px-5 text-sm font-bold text-white shadow-md transition-colors hover:bg-emerald-light"
                >
                  ثبت‌نام
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl text-navy md:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </header>
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
