import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getRequest,
  isUsingRedis,
  findRequestsByEmail,
  type ServiceRequest,
} from "@/lib/storage";
import { extractEmail } from "@/lib/email";
import { AdminShell } from "@/components/admin/admin-shell";
import { RequestEditor } from "@/components/admin/request-editor";
import { ClientHistory } from "@/components/admin/client-history";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getRequest(id);
  if (!item) notFound();

  // Если у клиента email — подтягиваем все его прошлые заявки
  const email = extractEmail(item.contact);
  const otherRequests: ServiceRequest[] = email
    ? (await findRequestsByEmail(email)).filter((r) => r.id !== id)
    : [];

  const storageMode = isUsingRedis() ? "redis" : "file";

  return (
    <AdminShell storageMode={storageMode}>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Все заявки
      </Link>

      <RequestEditor item={item} />

      {otherRequests.length > 0 && (
        <ClientHistory
          email={email!}
          items={otherRequests.map((r) => ({
            id: r.id,
            cemetery: r.cemetery,
            relativeName: r.relativeName,
            status: r.status,
            createdAt: r.createdAt,
          }))}
        />
      )}
    </AdminShell>
  );
}