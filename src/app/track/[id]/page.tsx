import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getRequest } from "@/lib/storage";
import { readClientSession, CLIENT_COOKIE } from "@/lib/client-session";
import { TrackView, type PublicRequest } from "./track-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Hatyra — Отслеживание заявки",
  robots: { index: false, follow: false },
};

export default async function TrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getRequest(id);
  if (!item) notFound();

  // ВАЖНО: явно выбираем поля, которые передаём клиенту. Поля `notes` (приватные
  // заметки админа) и `contact` НЕ должны попасть в HTML страницы — Next.js
  // сериализует объект в payload для гидратации.
  const publicItem: PublicRequest = {
    id: item.id,
    relativeName: item.relativeName,
    cemetery: item.cemetery,
    message: item.message,
    locale: item.locale,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    clientMessage: item.clientMessage,
  };

  const c = await cookies();
  const email = await readClientSession(c.get(CLIENT_COOKIE)?.value);

  return <TrackView item={publicItem} isLoggedIn={email !== null} />;
}
