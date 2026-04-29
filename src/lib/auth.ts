// Простая авторизация через подписанный cookie (HMAC-SHA256).
// Совместима с Edge Runtime (Web Crypto API), поэтому работает в middleware.

const COOKIE_NAME = "hatyra-admin";
const SESSION_DAYS = 30;

export const ADMIN_COOKIE = COOKIE_NAME;

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

export async function createSession(): Promise<{
  cookie: string;
  maxAge: number;
}> {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = JSON.stringify({ admin: true, exp });
  const value = b64urlEncode(new TextEncoder().encode(payload));
  const sig = await hmac(value, getSecret());
  return { cookie: `${value}.${sig}`, maxAge: SESSION_DAYS * 24 * 60 * 60 };
}

export async function verifySession(
  cookie: string | undefined | null,
): Promise<boolean> {
  if (!cookie) return false;
  const parts = cookie.split(".");
  if (parts.length !== 2) return false;
  const [value, sig] = parts;
  const expected = await hmac(value, getSecret());
  if (sig !== expected) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(value)));
    return payload.admin === true && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin";
}
