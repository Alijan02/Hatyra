"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";

export function FAQ() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section bg-muted/40">
      <div className="container-x">
        <div className="max-w-2xl mx-auto text-center">
          <div className="eyebrow mb-6">{t.faq.eyebrow}</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-foreground">
            {t.faq.title}
          </h2>
        </div>

        <div className="mt-12 max-w-3xl mx-auto space-y-3">
          {t.faq.items.map((item, i) => {
            const open = openIndex === i;
            return (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border/70 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 hover:bg-muted/40 transition-colors"
                >
                  <span className="text-base sm:text-lg text-foreground font-medium">
                    {item.q}
                  </span>
                  <span
                    className={`shrink-0 mt-1 text-accent transition-transform ${
                      open ? "rotate-45" : ""
                    }`}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </button>
                {open && (
                  <div className="px-6 pb-6 text-foreground/75 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
