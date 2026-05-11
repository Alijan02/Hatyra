import { cookies } from "next/headers";
import { getRequest, type ServiceRequest } from "@/lib/storage";
import type { Locale } from "@/lib/content";
import { RecoveryBannerClient, type RecoveryItem } from "./recovery-banner-client";

const TRACKS_COOKIE = "hatyra-tracks";

// Server component — читает cookie, передаёт минимум данных в клиентский компонент,
// который уже отвечает за отображение, дисмисс через sessionStorage и анимации.
export async function RecoveryBanner() {
  const c = await cookies();
  const raw = c.get(TRACKS_COOKIE)?.value ?? "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[0-9a-f-]{36}$/i.test(s));

  if (!ids.length) return null;

  const items = (await Promise.all(ids.map((id) => getRequest(id)))).filter(
    (x): x is ServiceRequest => x !== null,
  );

  if (!items.length) return null;

  // Только активные заявки имеют смысл показывать в плашке-напоминалке
  const activeItems = items.filter(
    (i) => i.status === "new" || i.status === "in_progress",
  );

  if (!activeItems.length) return null;

  const recoveryItems: RecoveryItem[] = activeItems.map((i) => ({
    id: i.id,
    status: i.status,
    cemetery: i.cemetery,
  }));

  const rawLocale = items[0].locale;
  const locale: Locale =
    rawLocale === "en" || rawLocale === "tk" || rawLocale === "tr"
      ? rawLocale
      : "ru";

  return <RecoveryBannerClient items={recoveryItems} locale={locale} />;
}