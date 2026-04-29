import { NextResponse } from "next/server";
import { createSession, ADMIN_COOKIE, getAdminPassword } from "@/lib/auth";

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.password || body.password !== getAdminPassword()) {
    return NextResponse.json(
      { error: "Неверный пароль" },
      { status: 401 },
    );
  }

  const { cookie, maxAge } = await createSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });
  return res;
}
