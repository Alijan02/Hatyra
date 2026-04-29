import Link from "next/link";
import type { ServiceRequest } from "@/lib/storage";
import { StatusBadge } from "./status-badge";

type Item = {
  id: string;
  cemetery: string;
  relativeName: string;
  status: ServiceRequest["status"];
  createdAt: string;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function ClientHistory({
  email,
  items,
}: {
  email: string;
  items: Item[];
}) {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-foreground/50">
            История клиента
          </div>
          <h2 className="text-xl text-foreground mt-1">
            Другие заявки от{" "}
            <span className="font-mono text-base text-foreground/80">{email}</span>
          </h2>
        </div>
        <span className="text-sm text-foreground/60">
          Всего ещё: {items.length}
        </span>
      </div>

      <ul className="bg-card rounded-2xl border border-border overflow-hidden">
        {items.map((item) => (
          <li
            key={item.id}
            className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
          >
            <Link
              href={`/admin/requests/${item.id}`}
              className="block px-5 py-4 flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              <span className="font-mono text-xs text-foreground/50 shrink-0">
                #{item.id.slice(0, 8).toUpperCase()}
              </span>
              <span className="font-medium text-foreground truncate flex-1 min-w-0">
                {item.cemetery}
              </span>
              {item.relativeName && (
                <span className="text-sm text-foreground/60 truncate min-w-0">
                  {item.relativeName}
                </span>
              )}
              <StatusBadge status={item.status} />
              <span className="text-xs text-foreground/50 shrink-0">
                {formatDate(item.createdAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}