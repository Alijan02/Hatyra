"use client";

import { useI18n } from "@/lib/i18n-context";
import { contacts } from "@/lib/content";
import { Ornament } from "./ornament";

export function SiteFooter() {
  const { t, locale } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background/85 mt-auto">
      <div className="container-x py-16 grid sm:grid-cols-3 gap-10">
        <div>
          <div className="font-display text-3xl text-background">
            {contacts.brandName}
          </div>
          <Ornament className="mt-4 h-3 w-24 text-accent/70" />
          <p className="mt-5 text-sm leading-relaxed text-background/70 max-w-xs">
            {t.footer.tagline}
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-background/50 mb-4">
            {t.nav.contact}
          </div>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href={`https://wa.me/${contacts.whatsapp}`}
                className="hover:text-accent transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp · {contacts.phone}
              </a>
            </li>
            <li>
              <a
                href={`https://t.me/${contacts.telegram}`}
                className="hover:text-accent transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram · @{contacts.telegram}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${contacts.email}`}
                className="hover:text-accent transition-colors"
              >
                {contacts.email}
              </a>
            </li>
            <li className="text-background/60">{contacts.city[locale]}</li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-background/50 mb-4">
            {t.nav.services}
          </div>
          <ul className="space-y-2 text-sm">
            {t.services.items.map((s, i) => (
              <li key={i} className="text-background/70">
                {s.title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container-x py-6 text-xs text-background/50 flex flex-col sm:flex-row justify-between gap-2">
          <span>
            © {year} {contacts.brandName}. {t.footer.rights}.
          </span>
          <span>{contacts.city[locale]}</span>
        </div>
      </div>
    </footer>
  );
}
