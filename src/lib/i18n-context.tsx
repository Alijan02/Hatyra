"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { content, type Locale, type Translation } from "./content";

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translation;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "hatyra-locale";

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "ru";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "ru" || saved === "en") return saved;
  const lang = navigator.language?.toLowerCase() ?? "";
  if (lang.startsWith("ru")) return "ru";
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ru");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLocaleState(detectInitialLocale());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, locale);
      document.documentElement.lang = locale;
    }
  }, [locale, hydrated]);

  const setLocale = (l: Locale) => setLocaleState(l);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: content[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
