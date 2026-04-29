import { NextResponse } from "next/server";
import { createRequest } from "@/lib/storage";
import { extractEmail } from "@/lib/email";
import { createClientSession, CLIENT_COOKIE } from "@/lib/client-session";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TRACKS_COOKIE = "hatyra-tracks";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;
const MAX_TRACKED = 5;

type Payload = {
  name?: string;
  contact?: string;
  relativeName?: string;
  cemetery?: string;
  message?: string;
  locale?: string;
};

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const required: (keyof Payload)[] = ["name", "contact", "cemetery", "message"];
  for (const key of required) {
    if (!body[key] || String(body[key]).trim().length < 1) {
      return NextResponse.json(
        { error: `Missing field: ${key}` },
        { status: 400 },
      );
    }
  }

  const item = await createRequest({
    name: String(body.name).trim(),
    contact: String(body.contact).trim(),
    relativeName: String(body.relativeName ?? "").trim(),
    cemetery: String(body.cemetery).trim(),
    message: String(body.message).trim(),
    locale: String(body.locale ?? "ru"),
  });

  const lines = [
    "🕯️ Новая заявка с сайта Hatyra",
    "",
    `👤 Имя: ${item.name}`,
    `📞 Контакт: ${item.contact}`,
    `🪦 Покойный: ${item.relativeName || "—"}`,
    `📍 Кладбище: ${item.cemetery}`,
    `💬 Сообщение: ${item.message}`,
    `🌐 Язык: ${item.locale}`,
    `🆔 ID: ${item.id}`,
  ];
  const text = lines.join("\n");

  console.log("\n" + "=".repeat(50));
  console.log(text);
  console.log("=".repeat(50) + "\n");

  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    try {
      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text,
            disable_web_page_preview: true,
          }),
        },
      );
    } catch (err) {
      console.error("Telegram send failed:", err);
    }
  }

  // Сохраняем ID в cookie на 90 дней — для cookie-based восстановления:
  // если клиент закроет вкладку и потом вернётся на главную, мы покажем
  // банер «у вас активная заявка». Храним до 5 последних ID через запятую.
  const res = NextResponse.json({ ok: true, id: item.id });
  const existing = req.headers.get("cookie") ?? "";
  const m = existing.match(/(?:^|;\s*)hatyra-tracks=([^;]+)/);
  const previous = m
    ? decodeURIComponent(m[1])
        .split(",")
        .map((s) => s.trim())
        .filter((s) => /^[0-9a-f-]{36}$/i.test(s) && s !== item.id)
    : [];
  const next = [item.id, ...previous].slice(0, MAX_TRACKED).join(",");

  res.cookies.set(TRACKS_COOKIE, next, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  // Если в контактах email — выдаём клиентскую сессию для личного кабинета /me
  const email = extractEmail(item.contact);
  if (email) {
    const session = await createClientSession(email);
    res.cookies.set(CLIENT_COOKIE, session.cookie, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: session.maxAge,
    });
  }

  return res;
}
