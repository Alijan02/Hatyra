"use client";

import { useI18n } from "@/lib/i18n-context";
import { images } from "@/lib/images";

export function Guarantee() {
  const { t } = useI18n();

  return (
    <section id="guarantee" className="section relative overflow-hidden">
      <div className="container-x">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Изображение слева — свеча, символ памяти */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden card-shadow">
              <img
                src={images.guarantee}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
            </div>

            {/* Плавающая «гарантия» — печать */}
            <div className="absolute top-6 left-6 sm:top-8 sm:left-8 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-accent text-white flex flex-col items-center justify-center text-center shadow-xl rotate-[-8deg] border-4 border-white/40 backdrop-blur-sm">
              <span className="font-display text-2xl sm:text-3xl leading-none mb-1">
                100%
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-widest leading-tight px-2">
                Гарантия
              </span>
            </div>
          </div>

          {/* Текст справа */}
          <div>
            <div className="eyebrow mb-6">{t.guarantee.eyebrow}</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-foreground mb-8">
              {t.guarantee.title}
            </h2>
            <div className="space-y-5 text-foreground/80 text-lg leading-relaxed">
              {t.guarantee.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>

        {/* 4 преимущества — карточки внизу */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.guarantee.perks.map((perk, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-6 border border-border/60 card-shadow hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 rounded-full bg-primary text-background flex items-center justify-center mb-4 font-display text-xl">
                {i + 1}
              </div>
              <h3 className="text-lg text-foreground mb-2">{perk.title}</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {perk.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
