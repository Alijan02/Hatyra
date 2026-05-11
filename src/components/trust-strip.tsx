"use client";

import { useI18n } from "@/lib/i18n-context";
import { images } from "@/lib/images";

export function TrustStrip() {
  const { locale } = useI18n();

  const VARIANTS = {
    ru: [
      { stat: "100%", title: "Прозрачность", text: "Фото и видео-отчёт по каждой работе. Показываем «до» и «после»." },
      { stat: "0₽", title: "Предоплаты", text: "Платите только после того, как увидите результат и одобрите его." },
      { stat: "24ч", title: "Ответ на заявку", text: "Связываемся с вами в течение суток. Пишите в любое время." },
    ],
    en: [
      { stat: "100%", title: "Transparency", text: "Photo and video report for every job. We show before and after." },
      { stat: "$0", title: "Prepayment", text: "Pay only after you've seen the result and approved it." },
      { stat: "24h", title: "Response time", text: "We get back to you within a day. Message us anytime." },
    ],
    tk: [
      { stat: "100%", title: "Açyklyk", text: "Her iş üçin surat we wideo hasabaty. «Öň» we «soň» görkezýäris." },
      { stat: "0₼", title: "Öňünden töleg ýok", text: "Netijäni görüp tassyklanyňyzdan soň tölärsiňiz." },
      { stat: "24s", title: "Jogap wagty", text: "Bir gün içinde habarlaşýarys. Islendik wagtda ýazyň." },
    ],
    tr: [
      { stat: "100%", title: "Şeffaflık", text: "Her iş için fotoğraf ve video raporu. «Önce» ve «sonra» gösteriyoruz." },
      { stat: "0₺", title: "Ön ödeme yok", text: "Sadece sonucu görüp onayladıktan sonra ödeme yaparsınız." },
      { stat: "24s", title: "Yanıt süresi", text: "24 saat içinde dönüş yaparız. İstediğiniz zaman yazın." },
    ],
  };
  const items = (VARIANTS[locale] ?? VARIANTS.ru).map((v, i) => ({
    ...v,
    image: images.trust[i],
  }));

  return (
    <section className="relative -mt-px bg-foreground text-background overflow-hidden">
      <div className="absolute inset-0 opacity-5 pattern-diamonds" />
      <div className="container-x relative py-16 sm:py-20">
        <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col">
              <div className="relative h-32 sm:h-36 mb-6 rounded-xl overflow-hidden">
                <img
                  src={item.image}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-foreground/40 to-foreground/70" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-5xl sm:text-6xl text-white">
                    {item.stat}
                  </span>
                </div>
              </div>
              <h3 className="text-xl text-background mb-2">{item.title}</h3>
              <p className="text-sm text-background/70 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
