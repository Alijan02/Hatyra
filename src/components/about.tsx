"use client";

import { useI18n } from "@/lib/i18n-context";
import { contacts } from "@/lib/content";
import { images } from "@/lib/images";

export function About() {
  const { t } = useI18n();
  const lines = t.about.title.split("\n");

  return (
    <section id="about" className="section relative overflow-hidden">
      {/* Тонкий фоновый паттерн */}
      <div className="absolute inset-0 pattern-dots opacity-50" />

      <div className="container-x relative grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Левая колонка — текст */}
        <div className="order-2 lg:order-1">
          <div className="eyebrow mb-6">{t.about.eyebrow}</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-foreground mb-8">
            {lines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h2>
          <div className="space-y-5 text-foreground/80 text-base leading-relaxed">
            {t.about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-border/60">
            <div className="text-sm text-foreground/60">
              {contacts.founderName !== "—" ? (
                <>
                  Основатель:{" "}
                  <span className="text-foreground font-medium">
                    {contacts.founderName}
                  </span>
                </>
              ) : (
                <span className="italic">Имя основателя появится здесь</span>
              )}
            </div>
          </div>
        </div>

        {/* Правая колонка — изображение в декоративной рамке */}
        <div className="order-1 lg:order-2 relative">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden card-shadow">
            <img
              src={images.about}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            {/* Лёгкий тёплый оверлей */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/10" />
          </div>

          {/* Декоративная плашка с цитатой */}
          <div className="absolute -bottom-6 -right-2 sm:-right-6 max-w-[280px] bg-card rounded-2xl p-5 sm:p-6 card-shadow border border-border/60">
            <svg
              width="22"
              height="18"
              viewBox="0 0 24 20"
              fill="hsl(var(--accent))"
              className="mb-3 opacity-70"
            >
              <path d="M0 20V13c0-3.5 1-6.5 3-9s4.5-4 7.5-4v3c-2 0-3.5 1-4.5 2.5S4 9 4 12h6v8H0zm14 0V13c0-3.5 1-6.5 3-9s4.5-4 7.5-4v3c-2 0-3.5 1-4.5 2.5s-2 3.5-2 6.5h6v8H14z" />
            </svg>
            <p className="text-sm text-foreground/80 leading-relaxed italic">
              «Память — это форма уважения, которая не знает расстояний.»
            </p>
          </div>

          {/* Декоративный элемент-цифра */}
          <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center backdrop-blur-sm">
            <span className="font-display text-2xl text-accent">
              2026
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
