import Link from "next/link";
import {
  listRequests,
  countByStatus,
  isUsingRedis,
  type RequestStatus,
} from "@/lib/storage";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatusBadge, STATUS_LABELS } from "@/components/admin/status-badge";

// Без кэша — всегда свежие данные.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const STATUS_ORDER: RequestStatus[] = [
  "new",
  "in_progress",
  "done",
  "cancelled",
];

function formatDate(iso: string, locale = "ru-RU"): string {
  try {
    return new Date(iso).toLocaleString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const filter = STATUS_ORDER.includes(params.status as RequestStatus)
    ? (params.status as RequestStatus)
    : null;

  const all = await listRequests();
  const counts = await countByStatus();
  const items = filter ? all.filter((x) => x.status === filter) : all;
  const storageMode = isUsingRedis() ? "redis" : "file";

  return (
    <AdminShell storageMode={storageMode}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-foreground mb-1">Заявки</h1>
          <p className="text-sm text-foreground/60">
            Всего: {all.length}{filter ? ` · фильтр: ${STATUS_LABELS[filter]}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin"
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            !filter
              ? "bg-primary text-background"
              : "bg-card border border-border hover:bg-muted"
          }`}
        >
          Все ({all.length})
        </Link>
        {STATUS_ORDER.map((s) => (
          <Link
            key={s}
            href={`/admin?status=${s}`}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              filter === s
                ? "bg-primary text-background"
                : "bg-card border border-border hover:bg-muted"
            }`}
          >
            {STATUS_LABELS[s]} ({counts[s]})
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="text-5xl mb-4 opacity-30">🕯️</div>
          <p className="text-lg text-foreground/70 mb-2">Пока заявок нет</p>
          <p className="text-sm text-foreground/50">
            {filter
              ? "Нет заявок с таким статусом"
              : "Когда клиент отправит форму с сайта — заявка появится здесь"}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="hidden lg:grid grid-cols-[1fr_1.2fr_1fr_140px_140px] gap-4 px-6 py-3 border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-foreground/60">
            <div>Имя / Контакт</div>
            <div>Сообщение</div>
            <div>Кладбище</div>
            <div>Статус</div>
            <div>Дата</div>
          </div>
          <ul>
            {items.map((item) => (
              <li
                key={item.id}
                className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
              >
                <Link
                  href={`/admin/requests/${item.id}`}
                  className="block px-6 py-4 lg:grid lg:grid-cols-[1fr_1.2fr_1fr_140px_140px] gap-4 items-start"
                >
                  <div>
                    <div className="font-medium text-foreground">
                      {item.name}
                    </div>
                    <div className="text-sm text-foreground/60 mt-0.5">
                      {item.contact}
                    </div>
                  </div>
                  <div className="text-sm text-foreground/75 mt-2 lg:mt-0 line-clamp-2">
                    {item.message}
                  </div>
                  <div className="text-sm text-foreground/70 mt-2 lg:mt-0">
                    {item.cemetery}
                  </div>
                  <div className="mt-2 lg:mt-0">
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="text-xs text-foreground/50 mt-2 lg:mt-0">
                    {formatDate(item.createdAt)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AdminShell>
  );
}
