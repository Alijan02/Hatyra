"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createRequest } from "@/lib/storage";
import { extractEmail } from "@/lib/email";
import { createClientSession, CLIENT_COOKIE } from "@/lib/client-session";

const TRACKS_COOKIE = "hatyra-tracks";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 дней
const MAX_TRACKED = 5;

async function rememberRequest(id: string, contact: string) {
  const c = await cookies();

  // Cookie со списком ID последних заявок — для баннера на главной
  const existing = c.get(TRACKS_COOKIE)?.value ?? "";
  const previous = existing
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[0-9a-f-]{36}$/i.test(s) && s !== id);
  const next = [id, ...previous].slice(0, MAX_TRACKED).join(",");

  c.set(TRACKS_COOKIE, next, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  // Если в контактах есть email — выдаём клиенту полноценную сессию.
  // Это превращает email в его «логин» — он может зайти на /me и увидеть
  // ВСЕ свои заявки. На другом устройстве авторизуется через magic-link.
  const email = extractEmail(contact);
  if (email) {
    const session = await createClientSession(email);
    c.set(CLIENT_COOKIE, session.cookie, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: session.maxAge,
    });
  }
}

export type ContactState = {
  ok: boolean;
  error?: "missing-fields" | "server-error";
};

export async function submitContactAction(
  _prevState: ContactState | null,
  formData: FormData,
): Promise<ContactState> {
  const data = {
    name: String(formData.get("name") ?? "").trim(),
    contact: String(formData.get("contact") ?? "").trim(),
    relativeName: String(formData.get("relativeName") ?? "").trim(),
    cemetery: String(formData.get("cemetery") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
    locale: String(formData.get("locale") ?? "ru"),
  };

  if (!data.name || !data.contact || !data.cemetery || !data.message) {
    return { ok: false, error: "missing-fields" };
  }

  try {
    const item = await createRequest(data);

    console.log("\n" + "=".repeat(50));
    console.log("🕯️ Новая заявка с сайта Hatyra");
    console.log(`👤 ${item.name}  📞 ${item.contact}`);
    console.log(`🪦 ${item.relativeName || "—"}  📍 ${item.cemetery}`);
    console.log(`💬 ${item.message}`);
    console.log(`🆔 ${item.id}`);
    console.log("=".repeat(50) + "\n");

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat = process.env.TELEGRAM_CHAT_ID;
    if (token && chat) {
      const text =
        "🕯️ Новая заявка с сайта Hatyra\n\n" +
        `👤 Имя: ${item.name}\n` +
        `📞 Контакт: ${item.contact}\n` +
        `🪦 Покойный: ${item.relativeName || "—"}\n` +
        `📍 Кладбище: ${item.cemetery}\n` +
        `💬 Сообщение: ${item.message}\n` +
        `🌐 Язык: ${item.locale}`;
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chat,
            text,
            disable_web_page_preview: true,
          }),
        });
      } catch (err) {
        console.error("Telegram send failed:", err);
      }
    }

    // Запоминаем ID в cookie на 90 дней — если клиент закроет сайт и вернётся,
    // покажем баннер «у вас есть активная заявка». Если в контактах есть email,
    // ещё и выдадим клиентскую сессию для личного кабинета /me.
    await rememberRequest(item.id, item.contact);

    // После сохранения уводим клиента на персональную страницу отслеживания.
    // redirect() работает как при наличии JS, так и без него (в no-JS случае
    // браузер делает обычный 303 переход, в JS — Next.js клиентский переход).
    redirect(`/track/${item.id}`);
  } catch (err) {
    // Important: redirect() throws a special error to signal redirect — пробросим.
    if (
      err instanceof Error &&
      (err as { digest?: string }).digest?.startsWith?.("NEXT_REDIRECT")
    ) {
      throw err;
    }
    console.error("Contact submit failed:", err);
    return { ok: false, error: "server-error" };
  }
}
