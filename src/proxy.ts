import { NextResponse, type NextRequest } from "next/server";
import { verifySession, ADMIN_COOKIE } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  const ok = await verifySession(cookie);
  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
}

// Защищаем /admin/** кроме страницы входа.
export const config = {
  matcher: ["/admin", "/admin/requests/:path*"],
};
