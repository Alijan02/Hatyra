// Сессия клиента — подписанный cookie с email-ом.
// Никаких паролей: после отправки формы или клика по magic-link мы выдаём
// клиенту cookie на 90 дней. /me читает cookie и показывает все его заявки.
//
// Также здесь — функции для magic-link токенов: одноразовые подписанные
// токены с email-ом и сроком жизни 30 минут. Используются для входа
// с другого устройства / после того как клиент удалил cookies.

const COOKIE_NAME = "hatyra-client";
const SESSION_DAYS = 90;
const MAGIC_LINK_MINUTES = 30;

export const CLIENT_COOKIE = COOKIE_NAME;

function getSecret(): string {
  return process.env.AUTH_SECRET || "dev-only-secret-change-me-in-production";
}

function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): Uint8Array {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
  const bin = atob(s + "=".repeat(pad));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmac(value: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return b64urlEncode(new Uint8Array(sig));
}

// ───────── Длинная сессия (cookie на 90 дней) ─────────

type SessionPayload = { email: string; iss: number; exp: number };

export async function createClientSession(
  email: string,
): Promise<{ cookie: string; maxAge: number }> {
  const now = Date.now();
  const exp = now + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    iss: now,
    exp,
  };
  const value = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmac(value, getSecret());
  return {
    cookie: `${value}.${sig}`,
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

export async function readClientSession(
  cookie: string | undefined | null,
): Promise<string | null> {
  if (!cookie) return null;
  const parts = cookie.split(".");
  if (parts.length !== 2) return null;
  const [value, sig] = parts;
  const expected = await hmac(value, getSecret());
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(
      new TextDecoder().decode(b64urlDecode(value)),
    ) as SessionPayload;
    if (typeof payload.email !== "string") return null;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload.email;
  } catch {
    return null;
  }
}

// ───────── Magic-link токены (короткие, 30 минут) ─────────

type MagicPayload = { email: string; iss: number; exp: number; t: "magic" };

export async function createMagicLinkToken(email: string): Promise<string> {
  const now = Date.now();
  const exp = now + MAGIC_LINK_MINUTES * 60 * 1000;
  const payload: MagicPayload = {
    email: email.trim().toLowerCase(),
    iss: now,
    exp,
    t: "magic",
  };
  const value = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmac(value, getSecret());
  return `${value}.${sig}`;
}

export async function verifyMagicLinkToken(
  token: string | undefined | null,
): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [value, sig] = parts;
  const expected = await hmac(value, getSecret());
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(
      new TextDecoder().decode(b64urlDecode(value)),
    ) as MagicPayload;
    if (payload.t !== "magic") return null;
    if (typeof payload.email !== "string") return null;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload.email;
  } catch {
    return null;
  }
}