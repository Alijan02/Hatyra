import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { readClientSession, CLIENT_COOKIE } from "@/lib/client-session";
import { findRequestsByEmail, type ServiceRequest } from "@/lib/storage";
import { MeView } from "./me-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Hatyra — Мой кабинет",
  robots: { index: false, follow: false },
};

// Только публичные поля заявки попадают на клиент.
export type MyRequest = {
  id: string;
  cemetery: string;
  relativeName: string;
  status: ServiceRequest["status"];
  createdAt: string;
  updatedAt: string;
  hasUpdate: boolean; // есть ли сообщение от админа
};

export default async function MePage() {
  const c = await cookies();
  const email = await readClientSession(c.get(CLIENT_COOKIE)?.value);

  if (!email) {
    redirect("/login?from=/me");
  }

  const items = await findRequestsByEmail(email);

  const myItems: MyRequest[] = items.map((r) => ({
    id: r.id,
    cemetery: r.cemetery,
    relativeName: r.relativeName,
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    hasUpdate: r.clientMessage.trim().length > 0,
  }));

  return <MeView email={email} items={myItems} />;
}