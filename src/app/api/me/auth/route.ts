import { NextResponse } from "next/server";
import {
  verifyMagicLinkToken,
  createClientSession,
  CLIENT_COOKIE,
} from "@/lib/client-session";

// Принимает magic-link: GET /api/me/auth?token=...&from=/me
// Если токен валиден — устанавливает клиентскую сессию и редиректит на from.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const from = url.searchParams.get("from") || "/me";

  const email = await verifyMagicLinkToken(token);
  if (!email) {
    // Токен невалиден или истёк — отправляем на /login с сообщением
    const loginUrl = new URL("/login", url);
    loginUrl.searchParams.set("expired", "1");
    return NextResponse.redirect(loginUrl);
  }

  // Безопасный from — только относительные пути в нашем приложении
  const safeFrom = from.startsWith("/") && !from.startsWith("//") ? from : "/me";
  const target = new URL(safeFrom, url);

  const session = await createClientSession(email);
  const res = NextResponse.redirect(target);
  res.cookies.set(CLIENT_COOKIE, session.cookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: session.maxAge,
  });
  return res;
}