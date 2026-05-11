"use client";

import { useI18n } from "@/lib/i18n-context";

// Иконки сервиса. Все 24×24, тонкая обводка 1.4, скруглённые концы —
// сдержанная стилистика gravure / классическая, подходит траурно-памятной
// тематике. Каждая иконка прямо передаёт смысл услуги.
const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.4",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const ICONS = [
  // 01 — Уборка и очистка → три искры (символ «очищено, приведено в порядок»)
  <svg key="0" {...svgProps}>
    <path d="M12 3 L13.4 8.2 L18.6 9.6 L13.4 11 L12 16.2 L10.6 11 L5.4 9.6 L10.6 8.2 Z" />
    <path d="M18.5 16 L19.1 17.7 L20.8 18.3 L19.1 18.9 L18.5 20.6 L17.9 18.9 L16.2 18.3 L17.9 17.7 Z" />
    <path d="M5.5 17.5 L5.9 18.8 L7.2 19.2 L5.9 19.6 L5.5 20.9 L5.1 19.6 L3.8 19.2 L5.1 18.8 Z" />
  </svg>,

  // 02 — Сезонный уход → круговая стрелка (цикл сезонов) с листком внутри
  <svg key="1" {...svgProps}>
    <path d="M20 12a8 8 0 1 1-2.5-5.8" />
    <polyline points="20.5 3.5 20.5 7 17 7" />
    <path d="M9 13c0-2.5 1.5-4.5 4-5 0 2.5-1.5 4.5-4 5z" />
  </svg>,

  // 03 — Оформление → тюльпан (классический мемориальный цветок)
  <svg key="2" {...svgProps}>
    <path d="M12 4c-2.5 0-4.5 2.2-4.5 5 0 1.6 1 2.5 2 2.5l2.5-1 2.5 1c1 0 2-.9 2-2.5 0-2.8-2-5-4.5-5z" />
    <path d="M9 11.5c.5 0 1-.4 1-1 .5 0 1 .4 1 1M14 11.5c.5 0 1-.4 1-1 .5 0 1 .4 1 1" />
    <path d="M12 4v10" />
    <path d="M12 14v7" />
    <path d="M12 17c-2.5 0-4.5-1-4.5-3 2 0 4.5 1 4.5 3z" />
  </svg>,

  // 04 — Памятные даты → горящая свеча (универсальный символ памяти)
  <svg key="3" {...svgProps}>
    <path d="M12 2c-1.5 1.8-2.2 3.3-2.2 4.6 0 1.3 1 2.4 2.2 2.4s2.2-1.1 2.2-2.4c0-1.3-.7-2.8-2.2-4.6z" />
    <path d="M12 9v2" />
    <rect x="9.5" y="11" width="5" height="9" rx="0.6" />
    <path d="M7.5 20h9" />
  </svg>,

  // 05 — Поиск могилы → лупа с map-pin внутри (находим место)
  <svg key="4" {...svgProps}>
    <circle cx="11" cy="11" r="7" />
    <line x1="16" y1="16" x2="21" y2="21" />
    <path d="M11 7.5c-1.5 0-2.7 1.2-2.7 2.7 0 2 2.7 4.3 2.7 4.3s2.7-2.3 2.7-4.3c0-1.5-1.2-2.7-2.7-2.7z" />
    <circle cx="11" cy="10.2" r="0.8" fill="currentColor" stroke="none" />
  </svg>,

  // 06 — Сопровождение визита → две фигуры рядом (мы рядом с клиентом)
  <svg key="5" {...svgProps}>
    <circle cx="9" cy="7" r="2.4" />
    <path d="M4.5 21v-3a3.2 3.2 0 0 1 3.2-3.2h2.6a3.2 3.2 0 0 1 3.2 3.2v3" />
    <circle cx="17" cy="9" r="1.9" />
    <path d="M14 21v-2.5a2.7 2.7 0 0 1 2.7-2.7h.6a2.7 2.7 0 0 1 2.7 2.7v2.5" />
  </svg>,
];

export function Services() {
  const { t } = useI18n();

  return (
    <section id="services" className="section bg-muted/40 relative overflow-hidden">
      {/* Декоративный круг-акцент в углу */}
      <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="container-x relative">
        <div className="max-w-2xl">
          <div className="eyebrow mb-6">{t.services.eyebrow}</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-foreground mb-6">
            {t.services.title}
          </h2>
          <p className="text-foreground/75 text-lg leading-relaxed">
            {t.services.subtitle}
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.services.items.map((item, i) => (
            <div
              key={i}
              className="group relative bg-card rounded-2xl p-7 border border-border/60 card-shadow hover:-translate-y-1 hover:border-accent/40 transition-all duration-300"
            >
              <div className="absolute top-7 right-7 font-display text-3xl text-accent/20 group-hover:text-accent/40 transition-colors">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center mb-5 shadow-md shadow-primary/20">
                <div className="w-7 h-7">{ICONS[i] ?? ICONS[0]}</div>
              </div>
              <h3 className="text-xl text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
