import { NextResponse } from "next/server";
import { verifySession, ADMIN_COOKIE } from "@/lib/auth";
import {
  updateRequest,
  deleteRequest,
  getRequest,
  type RequestStatus,
} from "@/lib/storage";
import { cookies, headers } from "next/headers";
import { extractEmail, sendStatusUpdateEmail } from "@/lib/email";

async function isAdmin() {
  const c = await cookies();
  return verifySession(c.get(ADMIN_COOKIE)?.value);
}

const VALID_STATUSES: RequestStatus[] = [
  "new",
  "in_progress",
  "done",
  "cancelled",
];

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  let body: { status?: string; notes?: string; clientMessage?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: {
    status?: RequestStatus;
    notes?: string;
    clientMessage?: string;
  } = {};
  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status as RequestStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = body.status as RequestStatus;
  }
  if (body.notes !== undefined) {
    patch.notes = String(body.notes);
  }
  if (body.clientMessage !== undefined) {
    patch.clientMessage = String(body.clientMessage);
  }

  // Сохраняем «до», чтобы понять что именно поменялось — нужно для email-уведомлений
  const before = await getRequest(id);
  if (!before) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await updateRequest(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Если изменилось что-то ВИДИМОЕ клиенту (статус или сообщение) и в контактах
  // есть email — шлём уведомление. Делаем без await, чтобы не задерживать ответ
  // админу даже если SMTP/Resend медленный.
  const changedStatus =
    patch.status !== undefined && patch.status !== before.status;
  const changedClientMessage =
    patch.clientMessage !== undefined &&
    patch.clientMessage !== before.clientMessage;

  if ((changedStatus || changedClientMessage) && updated.contact) {
    const email = extractEmail(updated.contact);
    if (email) {
      const h = await headers();
      const proto = h.get("x-forwarded-proto") || "http";
      const host = h.get("host") || "localhost:3000";
      const baseUrl =
        process.env.PUBLIC_BASE_URL || `${proto}://${host}`;

      sendStatusUpdateEmail({
        to: email,
        item: updated,
        baseUrl,
        changedStatus,
        changedClientMessage,
      }).catch((err) => console.error("[email] send error:", err));
    } else {
      console.log(
        `[email] контакт не похож на email (${updated.contact}), уведомление не отправлено`,
      );
    }
  }

  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await deleteRequest(id);
  return NextResponse.json({ ok: true });
}
