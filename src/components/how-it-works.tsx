"use client";

import { useI18n } from "@/lib/i18n-context";

export function HowItWorks() {
  const { t } = useI18n();

  return (
    <section id="how-it-works" className="section">
      <div className="container-x">
        <div className="max-w-2xl">
          <div className="eyebrow mb-6">{t.howItWorks.eyebrow}</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-foreground mb-6">
            {t.howItWorks.title}
          </h2>
          <p className="text-foreground/75 text-lg leading-relaxed">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <ol className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.howItWorks.steps.map((step, i) => (
            <li
              key={i}
              className="relative bg-card rounded-2xl p-7 border border-border/70 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="font-display text-5xl text-accent/40 leading-none mb-4">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-xl text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
