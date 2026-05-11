"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n-context";
import { contacts } from "@/lib/content";
import type { MyRequest } from "./page";

const STATUS_DOT = {
  new: "bg-blue-500",
  in_progress: "bg-amber-500",
  done: "bg-green-500",
  cancelled: "bg-zinc-400",
} as const;

function localeToBcp47(locale: string): string {
  if (locale === "en") return "en-US";
  if (locale === "tk") return "tk-TM";
  if (locale === "tr") return "tr-TR";
  return "ru-RU";
}

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(localeToBcp47(locale), {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// Анимация stagger-fade для списка заявок. Сдержанная: малое движение,
// мягкий ease, выключается если у пользователя включена prefers-reduced-motion.
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.22, 0.61, 0.36, 1] as const },
  },
};

export function MeView({
  email,
  items,
}: {
  email: string;
  items: MyRequest[];
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  async function logout() {
    await fetch("/api/me/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const tt = t.me;

  // Группируем по статусу — активные сверху
  const active = items.filter(
    (i) => i.status === "new" || i.status === "in_progress",
  );
  const finished = items.filter(
    (i) => i.status === "done" || i.status === "cancelled",
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-2xl text-foreground hover:text-primary transition-colors"
          >
            Hatyra
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-foreground/60">
              {email}
            </span>
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              {tt.logout}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.18em] text-accent font-medium mb-2">
            {tt.eyebrow}
          </div>
          <h1 className="text-3xl sm:text-4xl text-foreground mb-2">
            {tt.title}
          </h1>
          <p className="text-foreground/70">
            {tt.subtitle.replace("{count}", String(items.length))}
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyState locale={locale} />
        ) : (
          <>
            {active.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl text-foreground mb-4">{tt.active}</h2>
                <motion.ul
                  className="space-y-3"
                  variants={listVariants}
                  initial={prefersReducedMotion ? false : "hidden"}
                  animate="show"
                >
                  {active.map((item) => (
                    <motion.li key={item.id} variants={itemVariants}>
                      <RequestRow item={item} t={tt} locale={locale} />
                    </motion.li>
                  ))}
                </motion.ul>
              </section>
            )}

            {finished.length > 0 && (
              <section>
                <h2 className="text-xl text-foreground mb-4">{tt.archive}</h2>
                <motion.ul
                  className="space-y-3"
                  variants={listVariants}
                  initial={prefersReducedMotion ? false : "hidden"}
                  animate="show"
                >
                  {finished.map((item) => (
                    <motion.li key={item.id} variants={itemVariants}>
                      <RequestRow item={item} t={tt} locale={locale} />
                    </motion.li>
                  ))}
                </motion.ul>
              </section>
            )}
          </>
        )}

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <Link
            href="/#contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-background hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {tt.newRequest}
          </Link>

          <a
            href={`https://wa.me/${contacts.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-foreground/60 hover:text-foreground"
          >
            {tt.askQuestion}
          </a>
        </div>
      </main>
    </div>
  );
}

function RequestRow({
  item,
  t,
  locale,
}: {
  item: MyRequest;
  t: ReturnType<typeof useI18n>["t"]["me"];
  locale: string;
}) {
  return (
    <Link
      href={`/track/${item.id}`}
      className="block bg-card rounded-2xl border border-border p-5 hover:border-accent/40 hover:shadow-sm transition-all group"
    >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[item.status]}`} />
              <span className="text-sm font-medium text-foreground/80">
                {t.statusLabels[item.status]}
              </span>
              {item.hasUpdate && (
                <span className="inline-flex items-center gap-1 text-xs text-accent font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  {t.newMessage}
                </span>
              )}
            </div>
            <div className="font-display text-xl text-foreground mb-1 truncate">
              {item.cemetery}
            </div>
            {item.relativeName && (
              <div className="text-sm text-foreground/65 truncate">
                {item.relativeName}
              </div>
            )}
            <div className="text-xs text-foreground/50 mt-2">
              <span className="font-mono">#{item.id.slice(0, 8).toUpperCase()}</span>
              {" · "}
              {formatDate(item.createdAt, locale)}
            </div>
          </div>
          <div className="text-foreground/30 group-hover:text-accent transition-colors shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </Link>
  );
}

const EMPTY_TEXTS: Record<
  string,
  { title: string; text: string; cta: string }
> = {
  ru: {
    title: "Заявок пока нет",
    text: "Когда вы отправите заявку с главной страницы, она появится здесь.",
    cta: "Отправить заявку",
  },
  en: {
    title: "No requests yet",
    text: "When you submit a request from the main page, it will appear here.",
    cta: "Submit a request",
  },
  tk: {
    title: "Sargyt entek ýok",
    text: "Esasy sahypadan sargyt iberseňiz, ol şu ýerde peýda bolar.",
    cta: "Sargyt ibermek",
  },
  tr: {
    title: "Henüz talep yok",
    text: "Ana sayfadan bir talep gönderdiğinizde burada görünecektir.",
    cta: "Talep gönder",
  },
};

function EmptyState({ locale }: { locale: string }) {
  const t = EMPTY_TEXTS[locale] ?? EMPTY_TEXTS.ru;
  return (
    <div className="bg-card rounded-3xl border border-border p-10 sm:p-14 text-center">
      <div className="text-5xl mb-5 opacity-30">🕯️</div>
      <h3 className="text-xl text-foreground mb-2">{t.title}</h3>
      <p className="text-foreground/60 mb-6">{t.text}</p>
      <Link
        href="/#contact"
        className="inline-flex items-center px-6 py-3 rounded-full bg-primary text-background hover:bg-primary/90 transition-colors text-sm font-medium"
      >
        {t.cta}
      </Link>
    </div>
  );
}