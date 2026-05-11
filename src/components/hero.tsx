"use client";

import { useI18n } from "@/lib/i18n-context";
import { images } from "@/lib/images";
import { Ornament } from "./ornament";

export function Hero() {
  const { t } = useI18n();
  const lines = t.hero.title.split("\n");

  return (
    <section
      id="top"
      className="relative overflow-hidden min-h-[88vh] flex items-center bg-foreground"
    >
      {/* Базовый тёмный градиент — виден всегда, даже если картинка не загрузится */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, hsl(30 18% 16%) 0%, hsl(145 18% 22%) 100%)",
        }}
      />

      {/* Фоновое изображение поверх градиента */}
      <img
        src={images.hero}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />

      {/* Тёплый тёмный градиент поверх изображения — чтобы текст читался */}
      <div className="absolute inset-0 image-overlay-dark" />

      {/* Тонкий узор поверх для глубины */}
      <div className="absolute inset-0 opacity-[0.07] pattern-dots" />

      <div className="container-x relative z-10 py-20 sm:py-28 fade-up">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-3 mb-7">
            <Ornament className="h-2.5 w-12 text-accent" />
            <span className="text-xs uppercase tracking-[0.18em] text-accent font-medium">
              {t.hero.eyebrow}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white">
            {lines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-white/85 max-w-2xl leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-accent text-white hover:bg-accent/90 transition-all hover:scale-[1.02] text-base font-medium shadow-lg shadow-black/20"
            >
              {t.hero.ctaPrimary}
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-colors text-base"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>

        </div>
      </div>

      {/* Скролл-индикатор внизу */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:block">
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-xs uppercase tracking-widest">scroll</span>
          <svg width="14" height="22" viewBox="0 0 14 22" fill="none" className="animate-bounce" style={{ animationDuration: "2s" }}>
            <rect x="0.5" y="0.5" width="13" height="21" rx="6.5" stroke="currentColor" />
            <line x1="7" y1="6" x2="7" y2="10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </section>
  );
}
