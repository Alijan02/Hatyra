"use client";

import { useI18n } from "@/lib/i18n-context";
import { contacts } from "@/lib/content";
import { images } from "@/lib/images";

export function CtaBanner() {
  const { locale, t } = useI18n();

  const VARIANTS = {
    ru: {
      eyebrow: "Готовы помочь",
      title: "Расскажите о вашей ситуации",
      text: "Свяжитесь с нами любым удобным способом. Свяжемся в течение 24 часов, проконсультируем бесплатно.",
    },
    en: {
      eyebrow: "Ready to help",
      title: "Tell us about your situation",
      text: "Reach out any way that's convenient. We'll get back within 24 hours — free consultation.",
    },
    tk: {
      eyebrow: "Kömek etmäge taýýar",
      title: "Ýagdaýyňyzy aýdyň",
      text: "Islendik amatly usulda habarlaşyň. 24 sagadyň içinde jogap bererarys, mugt geňeş bereris.",
    },
    tr: {
      eyebrow: "Yardıma hazırız",
      title: "Durumunuzu anlatın",
      text: "Size uygun herhangi bir yolla iletişime geçin. 24 saat içinde dönüş yaparız, ücretsiz danışmanlık veririz.",
    },
  };
  const content = VARIANTS[locale] ?? VARIANTS.ru;

  return (
    <section className="relative overflow-hidden">
      {/* Фоновое изображение листьев */}
      <img
        src={images.leaves}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/85 to-foreground/75" />

      <div className="container-x relative py-16 sm:py-20">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.18em] text-accent font-medium mb-4">
            {content.eyebrow}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-white mb-5">
            {content.title}
          </h2>
          <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-2xl">
            {content.text}
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#contact"
              className="inline-flex items-center px-7 py-3.5 rounded-full bg-accent text-white hover:bg-accent/90 transition-all hover:scale-[1.02] font-medium shadow-lg shadow-black/30"
            >
              {t.nav.cta}
            </a>
            <a
              href={`https://wa.me/${contacts.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 1.9 6.5L4 29l7.7-2c1.8 1 3.9 1.5 6.3 1.5C24.6 28.5 30 23.1 30 16.5S22.7 3 16 3Z" />
              </svg>
              WhatsApp
            </a>
            <a
              href={`https://t.me/${contacts.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0a12 12 0 100 24 12 12 0 000-24zm5.6 8.2-1.9 9.1c-.1.7-.5.8-1.1.5l-3-2.2-1.4 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.5-5c.2-.2 0-.3-.3-.1L7.9 13.1l-3-1c-.6-.2-.6-.6.1-.9l11.6-4.5c.5-.2 1 .1.8.5z" />
              </svg>
              Telegram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
