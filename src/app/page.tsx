import { cookies } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { RecoveryBanner } from "@/components/recovery-banner";
import { Hero } from "@/components/hero";
import { TrustStrip } from "@/components/trust-strip";
import { About } from "@/components/about";
import { HowItWorks } from "@/components/how-it-works";
import { Services } from "@/components/services";
import { Guarantee } from "@/components/guarantee";
import { FAQ } from "@/components/faq";
import { CtaBanner } from "@/components/cta-banner";
import { Contact } from "@/components/contact";
import { SiteFooter } from "@/components/site-footer";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { readClientSession, CLIENT_COOKIE } from "@/lib/client-session";

export const dynamic = "force-dynamic"; // нужно чтобы RecoveryBanner и шапка читали cookie

export default async function HomePage() {
  const c = await cookies();
  const email = await readClientSession(c.get(CLIENT_COOKIE)?.value);
  const isLoggedIn = email !== null;

  return (
    <>
      <SiteHeader isLoggedIn={isLoggedIn} />
      <main id="main-content" className="flex-1">
        <Hero />
        <TrustStrip />
        <About />
        <HowItWorks />
        <Services />
        <Guarantee />
        <FAQ />
        <CtaBanner />
        <Contact />
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
      {/* Плавающая плашка-напоминалка о активной заявке.
          Только на главной (на /track, /me и /admin не нужна — там и так инфа).
          Сама прячется если нет активных заявок или клиент дисмиссил в этой сессии. */}
      <RecoveryBanner />
    </>
  );
}
