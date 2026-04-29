import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { I18nProvider } from "@/lib/i18n-context";
import { contacts } from "@/lib/content";
import "./globals.css";

const sans = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const display = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${contacts.brandName} — Уход за могилами в Туркменистане`,
  description:
    "Сервис ухода за могилами в Туркменистане для тех, кто живёт за границей. Уборка, оформление, фото- и видео-отчёт. Оплата только после подтверждения работы.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen flex flex-col">
        {/* Skip-link: невидим для зрячих, появляется при Tab-навигации.
            Помогает пользователям screen-reader / клавиатуры пропустить шапку. */}
        <a href="#main-content" className="skip-link">
          Перейти к содержанию
        </a>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
