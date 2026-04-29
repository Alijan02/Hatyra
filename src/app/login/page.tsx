import { LoginClient } from "./login-client";

export const metadata = {
  title: "Hatyra — Вход",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const sp = await searchParams;
  return <LoginClient from={sp.from || "/me"} />;
}