"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n-context";
import { contacts } from "@/lib/content";
import {
  submitContactAction,
  type ContactState,
} from "@/app/contact-action";

export function Contact() {
  const { t, locale } = useI18n();

  // При успешной отправке action делает redirect на /track/[id], поэтому
  // success в state мы здесь не увидим — нужен только error для валидации.
  const [state, action, pending] = useActionState<
    ContactState | null,
    FormData
  >(submitContactAction, null);

  const labels = t.contact.labels;
  const ph = t.contact.placeholders;
  const inputCls =
    "w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors text-foreground placeholder:text-foreground/40";

  return (
    <section id="contact" className="section">
      <div className="container-x grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div>
          <div className="eyebrow mb-6">{t.contact.eyebrow}</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-foreground mb-6">
            {t.contact.title}
          </h2>
          <p className="text-foreground/75 text-lg leading-relaxed mb-10">
            {t.contact.subtitle}
          </p>

          <div className="space-y-3">
            <div className="text-sm text-foreground/60 mb-3">
              {t.contact.orWrite}
            </div>
            <a
              href={`https://wa.me/${contacts.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 1.9 6.5L4 29l7.7-2c1.8 1 3.9 1.5 6.3 1.5C24.6 28.5 30 23.1 30 16.5S22.7 3 16 3Z" />
                </svg>
              </span>
              <span>WhatsApp · {contacts.phone}</span>
            </a>
            <a
              href={`https://t.me/${contacts.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0a12 12 0 100 24 12 12 0 000-24zm5.6 8.2-1.9 9.1c-.1.7-.5.8-1.1.5l-3-2.2-1.4 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.5-5c.2-.2 0-.3-.3-.1L7.9 13.1l-3-1c-.6-.2-.6-.6.1-.9l11.6-4.5c.5-.2 1 .1.8.5z" />
                </svg>
              </span>
              <span>Telegram · @{contacts.telegram}</span>
            </a>
            <a
              href={`mailto:${contacts.email}`}
              className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </span>
              <span>{contacts.email}</span>
            </a>
          </div>
        </div>

        <form
          action={action}
          className="bg-card rounded-3xl p-7 sm:p-9 border border-border/70 shadow-sm space-y-4"
        >
          {/* Скрытое поле — язык клиента */}
          <input type="hidden" name="locale" value={locale} />

          <div>
            <label className="block text-sm text-foreground/70 mb-2" htmlFor="name">
              {labels.name}
            </label>
            <input id="name" name="name" required className={inputCls} placeholder={ph.name} />
          </div>
          <div>
            <label className="block text-sm text-foreground/70 mb-2" htmlFor="contact">
              {labels.contact}
            </label>
            <input id="contact" name="contact" required className={inputCls} placeholder={ph.contact} />
            <p className="mt-1.5 text-xs text-foreground/55 leading-relaxed">
              {t.contact.contactHint}
            </p>
          </div>
          <div>
            <label className="block text-sm text-foreground/70 mb-2" htmlFor="relativeName">
              {labels.relativeName}
            </label>
            <input id="relativeName" name="relativeName" className={inputCls} placeholder={ph.relativeName} />
          </div>
          <div>
            <label className="block text-sm text-foreground/70 mb-2" htmlFor="cemetery">
              {labels.cemetery}
            </label>
            <input id="cemetery" name="cemetery" required className={inputCls} placeholder={ph.cemetery} />
          </div>
          <div>
            <label className="block text-sm text-foreground/70 mb-2" htmlFor="message">
              {labels.message}
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              className={inputCls}
              placeholder={ph.message}
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full px-6 py-4 rounded-full bg-primary text-background hover:bg-primary/90 transition-colors text-base font-medium disabled:opacity-60"
          >
            {pending ? labels.sending : labels.send}
          </button>

          {state?.error && (
            <p
              role="alert"
              aria-live="assertive"
              className="text-sm text-red-600 text-center"
            >
              {labels.error}
            </p>
          )}

          {/* Восстановление ссылки на отслеживание */}
          <div className="pt-3 mt-2 border-t border-border/60 text-center text-xs text-foreground/55">
            {t.recovery.lostLink}{" "}
            <Link
              href="/find"
              className="text-accent hover:text-accent/80 underline underline-offset-2"
            >
              {t.recovery.findByEmail} →
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
