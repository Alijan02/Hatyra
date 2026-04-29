"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n-context";
import { findByEmailAction, type FindState } from "@/app/find-action";

export function FindClient() {
  const { t, locale } = useI18n();
  const [state, action, pending] = useActionState<FindState | null, FormData>(
    findByEmailAction,
    null,
  );

  const tt = t.find;
  const inputCls =
    "w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors text-foreground placeholder:text-foreground/40";

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
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

        {state?.ok ? (
          <div className="bg-card rounded-3xl border border-border p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </div>
            <h1 className="text-2xl text-foreground mb-3">{tt.successTitle}</h1>
            <p className="text-sm text-foreground/70 leading-relaxed mb-2">
              {tt.successText}
            </p>
            {state.emailSentTo && (
              <p className="text-sm text-foreground font-medium mt-4">
                {state.emailSentTo}
              </p>
            )}
            <Link
              href="/"
              className="inline-block mt-8 text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              ← {tt.backToHome}
            </Link>
          </div>
        ) : (
          <form
            action={action}
            className="bg-card rounded-3xl border border-border p-8"
          >
            <input type="hidden" name="locale" value={locale} />

            <h1 className="text-2xl sm:text-3xl text-foreground mb-3">
              {tt.title}
            </h1>
            <p className="text-sm text-foreground/70 leading-relaxed mb-6">
              {tt.subtitle}
            </p>

            <label className="block text-sm text-foreground/70 mb-2" htmlFor="email">
              {tt.emailLabel}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              className={inputCls}
              placeholder={tt.emailPlaceholder}
            />

            {state?.error && (
              <p
                role="alert"
                aria-live="assertive"
                className="mt-3 text-sm text-red-600"
              >
                {state.error === "missing-email" && tt.errors.missing}
                {state.error === "invalid-email" && tt.errors.invalid}
                {state.error === "server-error" && tt.errors.server}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full mt-6 px-6 py-3 rounded-full bg-primary text-background hover:bg-primary/90 transition-colors font-medium disabled:opacity-60"
            >
              {pending ? tt.sending : tt.submit}
            </button>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                ← {tt.backToHome}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
