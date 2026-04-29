"use server";

import { headers } from "next/headers";
import { findRequestsByEmail } from "@/lib/storage";
import { sendRecoveryEmail } from "@/lib/email";

export type FindState = {
  ok: boolean;
  // Не раскрываем, нашли ли мы заявки — просто говорим «если email есть в системе,
  // мы отправили письмо». Это защищает приватность.
  emailSentTo?: string;
  error?: "missing-email" | "invalid-email" | "server-error";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function findByEmailAction(
  _prevState: FindState | null,
  formData: FormData,
): Promise<FindState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const locale = String(formData.get("locale") ?? "ru");

  if (!email) return { ok: false, error: "missing-email" };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "invalid-email" };

  try {
    const items = await findRequestsByEmail(email);

    // Получаем base URL для ссылок в письме.
    const h = await headers();
    const proto = h.get("x-forwarded-proto") || "http";
    const host = h.get("host") || "localhost:3000";
    const baseUrl = process.env.PUBLIC_BASE_URL || `${proto}://${host}`;

    // Шлём всегда — даже если заявок 0. В письме напишем «не нашли ничего» —
    // так клиент поймёт, что email указан неправильно или с другого адреса.
    // Если нет настроенного Resend — модуль просто залогирует.
    await sendRecoveryEmail({
      to: email,
      items: items.map((i) => ({
        id: i.id,
        status: i.status,
        cemetery: i.cemetery,
        createdAt: i.createdAt,
      })),
      baseUrl,
      locale,
    });

    return { ok: true, emailSentTo: email };
  } catch (err) {
    console.error("find-action failed:", err);
    return { ok: false, error: "server-error" };
  }
}
