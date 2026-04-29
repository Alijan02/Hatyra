"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { RequestStatus } from "@/lib/storage";
import { useI18n } from "@/lib/i18n-context";
import { contacts } from "@/lib/content";

// Только безопасные поля. notes (внутренние заметки админа) и contact
// (личный контакт клиента) сюда НЕ передаются.
export type PublicRequest = {
  id: string;
  relativeName: string;
  cemetery: string;
  message: string;
  locale: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  clientMessage: string;
};

const STATUS_TONE: Record<
  RequestStatus,
  { dot: string; bg: string; text: string; ring: string }
> = {
  new: {
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-900",
    ring: "ring-blue-200",
  },
  in_progress: {
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-900",
    ring: "ring-amber-200",
  },
  done: {
    dot: "bg-green-500",
    bg: "bg-green-50",
    text: "text-green-900",
    ring: "ring-green-200",
  },
  cancelled: {
    dot: "bg-zinc-400",
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    ring: "ring-zinc-200",
  },
};

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleString(locale === "en" ? "en-US" : "ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function TrackView({
  item,
  isLoggedIn = false,
}: {
  item: PublicRequest;
  isLoggedIn?: boolean;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setUrl(window.location.href);
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  async function refresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 600);
  }

  const tone = STATUS_TONE[item.status];
  const tt = t.track;

  return (
    <div className="min-h-screen bg-muted/30 py-12 sm:py-20 px-5">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-block font-display text-3xl text-foreground hover:text-primary transition-colors"
          >
            Hatyra
          </Link>
          <div className="text-xs uppercase tracking-[0.18em] text-accent font-medium mt-3">
            {tt.eyebrow}
          </div>
        </div>

        {/* Шапка с статусом */}
        <div className={`rounded-3xl p-7 sm:p-10 ring-1 ${tone.ring} ${tone.bg} mb-6`}>
          <div className="flex items-start gap-4">
            <span
              className={`mt-2 w-3 h-3 rounded-full ${tone.dot} shrink-0`}
              aria-hidden
            >
              <span className={`block w-3 h-3 rounded-full ${tone.dot} animate-ping opacity-60`} />
            </span>
            <div>
              <div className={`text-xs uppercase tracking-wider ${tone.text} opacity-70 mb-1`}>
                {tt.status}
              </div>
              <h1 className={`text-2xl sm:text-3xl font-display ${tone.text} leading-snug`}>
                {tt.statusLabels[item.status]}
              </h1>
              <p className={`mt-3 ${tone.text} opacity-80`}>
                {tt.statusDescriptions[item.status]}
              </p>
            </div>
          </div>
        </div>

        {/* Сообщение от админа клиенту */}
        <div className="bg-card rounded-3xl p-7 sm:p-10 border border-border mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--accent))" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <div className="text-xs uppercase tracking-wider text-foreground/60">
              {tt.messageFromUs}
            </div>
          </div>
          {item.clientMessage ? (
            <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {item.clientMessage}
            </p>
          ) : (
            <p className="text-foreground/50 italic">{tt.noMessageYet}</p>
          )}
        </div>

        {/* Меta — номер, даты, копирование ссылки */}
        <div className="bg-card rounded-3xl p-7 sm:p-10 border border-border mb-6">
          <p className="text-sm text-foreground/70 leading-relaxed mb-5">
            {tt.saveLink}
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-background hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                {copied ? (
                  <path d="M20 6L9 17l-5-5" />
                ) : (
                  <>
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </>
                )}
              </svg>
              {copied ? tt.copied : tt.copy}
            </button>
            <button
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border hover:bg-muted transition-colors text-sm disabled:opacity-50"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className={refreshing ? "animate-spin" : ""}
              >
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M3 21v-5h5" />
              </svg>
              {tt.checkAgain}
            </button>
          </div>

          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 pt-6 border-t border-border">
            <div>
              <dt className="text-xs uppercase tracking-wider text-foreground/50 mb-1">
                {tt.number}
              </dt>
              <dd className="font-mono text-sm text-foreground">
                #{item.id.slice(0, 8).toUpperCase()}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-foreground/50 mb-1">
                {tt.submitted}
              </dt>
              <dd className="text-sm text-foreground">
                {formatDate(item.createdAt, item.locale)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-foreground/50 mb-1">
                {tt.lastUpdate}
              </dt>
              <dd className="text-sm text-foreground">
                {formatDate(item.updatedAt, item.locale)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Что вы попросили */}
        <div className="bg-card rounded-3xl p-7 sm:p-10 border border-border mb-6">
          <div className="text-xs uppercase tracking-wider text-foreground/60 mb-5">
            {tt.yourRequest}
          </div>
          <dl className="space-y-4">
            <Field label={tt.cemetery}>{item.cemetery}</Field>
            {item.relativeName && (
              <Field label={tt.relativeName}>{item.relativeName}</Field>
            )}
            <Field label={tt.whatYouAsked}>
              <span className="whitespace-pre-wrap leading-relaxed">
                {item.message}
              </span>
            </Field>
          </dl>
        </div>

        {/* Контакты */}
        <div className="bg-card rounded-3xl p-7 sm:p-10 border border-border">
          <div className="text-xs uppercase tracking-wider text-foreground/60 mb-5">
            {tt.contactUs}
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${contacts.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#25D366] text-white text-sm font-medium hover:bg-[#1ebe5a] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 1.9 6.5L4 29l7.7-2c1.8 1 3.9 1.5 6.3 1.5C24.6 28.5 30 23.1 30 16.5S22.7 3 16 3Z" />
              </svg>
              WhatsApp
            </a>
            <a
              href={`https://t.me/${contacts.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#229ED9] text-white text-sm font-medium hover:bg-[#1c84b4] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0a12 12 0 100 24 12 12 0 000-24zm5.6 8.2-1.9 9.1c-.1.7-.5.8-1.1.5l-3-2.2-1.4 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.5-5c.2-.2 0-.3-.3-.1L7.9 13.1l-3-1c-.6-.2-.6-.6.1-.9l11.6-4.5c.5-.2 1 .1.8.5z" />
              </svg>
              Telegram
            </a>
            <a
              href={`mailto:${contacts.email}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border text-foreground hover:bg-muted transition-colors text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
              {contacts.email}
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <Link
            href="/"
            className="text-foreground/60 hover:text-foreground transition-colors"
          >
            ← {tt.backToHome}
          </Link>
          {isLoggedIn && (
            <Link
              href="/me"
              className="text-accent hover:text-accent/80 underline underline-offset-2 font-medium"
            >
              {t.me.title} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-foreground/50 mb-1">
        {label}
      </dt>
      <dd className="text-foreground/90">{children}</dd>
    </div>
  );
}
