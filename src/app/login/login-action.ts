"use server";

import { headers } from "next/headers";
import { findRequestsByEmail } from "@/lib/storage";
import { createMagicLinkToken } from "@/lib/client-session";
import { sendMagicLinkEmail } from "@/lib/email";

export type LoginState = {
  ok: boolean;
  emailSentTo?: string;
  error?: "missing-email" | "invalid-email" | "server-error";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginAction(
  _prev: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const locale = String(formData.get("locale") ?? "ru");
  const from = String(formData.get("from") ?? "/me");

  if (!email) return { ok: false, error: "missing-email" };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "invalid-email" };

  try {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") || "http";
    const host = h.get("host") || "localhost:3000";
    const baseUrl = process.env.PUBLIC_BASE_URL || `${proto}://${host}`;

    // Если у этого email вообще нет заявок — всё равно делаем вид что
    // отправили (приватность). Но реально шлём только если есть.
    const items = await findRequestsByEmail(email);
    if (items.length > 0) {
      const token = await createMagicLinkToken(email);
      const link = `${baseUrl}/api/me/auth?token=${encodeURIComponent(token)}&from=${encodeURIComponent(from)}`;
      await sendMagicLinkEmail({ to: email, link, baseUrl, locale });
    } else {
      console.log(
        `[login] для ${email} заявок нет — magic-link не отправлен (но клиенту покажем «проверьте почту» для приватности)`,
      );
    }

    return { ok: true, emailSentTo: email };
  } catch (err) {
    console.error("login action failed:", err);
    return { ok: false, error: "server-error" };
  }
}