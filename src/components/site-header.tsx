"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n-context";
import { contacts } from "@/lib/content";

export function SiteHeader({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const { t, locale, setLocale } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#about", label: t.nav.about },
    { href: "#how-it-works", label: t.nav.howItWorks },
    { href: "#services", label: t.nav.services },
    { href: "#guarantee", label: t.nav.guarantee },
    { href: "#faq", label: t.nav.faq },
  ];

  // Поверх героя — прозрачная белая, при скролле — кремовый фон
  const dark = !scrolled;
  const text = dark ? "text-white" : "text-foreground";
  const textMuted = dark ? "text-white/75 hover:text-white" : "text-foreground/75 hover:text-foreground";
  const langActive = dark ? "text-white font-medium" : "text-foreground font-medium";
  const langIdle = dark ? "text-white/50 hover:text-white/80" : "text-foreground/40 hover:text-foreground/70";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border/60"
          : "bg-transparent"
      }`}
    >
      <div className="container-x flex items-center justify-between h-16 sm:h-20">
        <a href="#top" className={`font-display text-2xl sm:text-3xl ${text} transition-colors`}>
          {contacts.brandName}
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm transition-colors ${textMuted}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center text-xs">
            <button
              onClick={() => setLocale("ru")}
              className={`px-2 py-1 rounded transition-colors ${
                locale === "ru" ? langActive : langIdle
              }`}
              aria-label="Русский"
            >
              RU
            </button>
            <span className={dark ? "text-white/30" : "text-foreground/30"}>|</span>
            <button
              onClick={() => setLocale("en")}
              className={`px-2 py-1 rounded transition-colors ${
                locale === "en" ? langActive : langIdle
              }`}
              aria-label="English"
            >
              EN
            </button>
          </div>

          {isLoggedIn ? (
            <Link
              href="/me"
              className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                dark
                  ? "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
                  : "bg-primary text-background hover:bg-primary/90"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
              </svg>
              {t.me.title}
            </Link>
          ) : (
            <a
              href="#contact"
              className={`hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm transition-colors ${
                dark
                  ? "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
                  : "bg-primary text-background hover:bg-primary/90"
              }`}
            >
              {t.nav.cta}
            </a>
          )}

          <button
            className={`lg:hidden p-2 ${text}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Меню"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <>
                  <line x1="3" y1="7" x2="21" y2="7" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="17" x2="21" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border/60 bg-background">
          <nav className="container-x py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-foreground/80 hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            {isLoggedIn ? (
              <Link
                href="/me"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-primary text-background"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                </svg>
                {t.me.title}
              </Link>
            ) : (
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-center px-4 py-3 rounded-full bg-primary text-background"
              >
                {t.nav.cta}
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
