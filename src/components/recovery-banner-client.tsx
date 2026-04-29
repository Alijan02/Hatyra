"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { RequestStatus } from "@/lib/storage";

export type RecoveryItem = {
  id: string;
  status: RequestStatus;
  cemetery: string;
};

const STATUS_DOT: Record<RequestStatus, string> = {
  new: "bg-blue-500",
  in_progress: "bg-amber-500",
  done: "bg-green-500",
  cancelled: "bg-zinc-400",
};

const T = {
  ru: {
    single: "У вас активная заявка",
    multipleN: (n: number) => `${n} активных заявок`,
    statusLabels: {
      new: "Получена",
      in_progress: "В работе",
      done: "Выполнена",
      cancelled: "Отменена",
    } as Record<RequestStatus, string>,
    open: "Открыть",
    dismiss: "Скрыть",
    seeAll: "Все мои заявки",
  },
  en: {
    single: "You have an active request",
    multipleN: (n: number) => `${n} active requests`,
    statusLabels: {
      new: "Received",
      in_progress: "In progress",
      done: "Done",
      cancelled: "Cancelled",
    } as Record<RequestStatus, string>,
    open: "Open",
    dismiss: "Hide",
    seeAll: "All my requests",
  },
};

const DISMISS_KEY = "hatyra-banner-dismissed";

export function RecoveryBannerClient({
  items,
  locale,
}: {
  items: RecoveryItem[];
  locale: "ru" | "en";
}) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Проверяем дисмисс-флаг для текущей сессии (не показываем повторно
  // в течение одной сессии браузера, если клиент уже закрыл).
  useEffect(() => {
    const stored = sessionStorage.getItem(DISMISS_KEY);
    if (stored) setDismissed(true);
    // Лёгкая задержка перед появлением — чтобы не выскакивало мгновенно
    const t = setTimeout(() => setMounted(true), 600);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  if (dismissed || !mounted || items.length === 0) return null;

  const t = T[locale];
  const isMultiple = items.length > 1;
  const single = items[0];

  return (
    <div
      className="fixed z-40 top-20 sm:top-24 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-[360px] animate-[recovery-slide_0.4s_ease-out]"
      style={{
        animationName: "recovery-slide",
      }}
    >
      <style jsx>{`
        @keyframes recovery-slide {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="relative bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-lg shadow-black/10 overflow-hidden">
        {/* Тонкая акцентная полоска сверху — намёк на «активность» */}
        <div className="h-0.5 bg-gradient-to-r from-accent/60 via-accent to-accent/60" />

        <div className="px-4 py-3">
          {!isMultiple ? (
            // Одна заявка — компактная плашка
            <div className="flex items-center gap-3">
              <span className="relative shrink-0">
                <span
                  className={`block w-2 h-2 rounded-full ${STATUS_DOT[single.status]}`}
                />
                <span
                  className={`absolute inset-0 w-2 h-2 rounded-full ${STATUS_DOT[single.status]} animate-ping opacity-50`}
                />
              </span>

              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground/60 leading-tight">
                  {t.single}
                </div>
                <div className="text-sm text-foreground/85 truncate leading-tight">
                  {t.statusLabels[single.status]}
                </div>
              </div>

              <Link
                href={`/track/${single.id}`}
                className="text-xs font-medium text-accent hover:text-accent/80 whitespace-nowrap"
              >
                {t.open} →
              </Link>

              <button
                onClick={dismiss}
                aria-label={t.dismiss}
                className="text-foreground/30 hover:text-foreground/60 p-1 -m-1 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            // Несколько заявок — раскрывающаяся плашка
            <>
              <div className="flex items-center gap-3">
                <span className="relative shrink-0">
                  <span className="block w-2 h-2 rounded-full bg-accent" />
                  <span className="absolute inset-0 w-2 h-2 rounded-full bg-accent animate-ping opacity-50" />
                </span>

                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="text-xs text-foreground/60 leading-tight">
                    Hatyra
                  </div>
                  <div className="text-sm text-foreground/85 leading-tight">
                    {t.multipleN(items.length)}
                  </div>
                </button>

                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="text-foreground/40 hover:text-foreground/70 p-1 -m-1"
                  aria-label={expanded ? "Collapse" : "Expand"}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                <button
                  onClick={dismiss}
                  aria-label={t.dismiss}
                  className="text-foreground/30 hover:text-foreground/60 p-1 -m-1 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {expanded && (
                <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/track/${item.id}`}
                      className="flex items-center gap-2 px-2 py-1.5 -mx-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[item.status]} shrink-0`}
                      />
                      <span className="text-xs text-foreground/85 truncate flex-1 min-w-0">
                        {item.cemetery}
                      </span>
                      <span className="text-xs text-foreground/50 shrink-0">
                        {t.statusLabels[item.status]}
                      </span>
                    </Link>
                  ))}
                  <Link
                    href="/me"
                    className="block text-center text-xs font-medium text-accent hover:text-accent/80 pt-2"
                  >
                    {t.seeAll} →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}