// Хранилище заявок с двойным режимом:
//  - Локально: JSON-файл в /tmp/hatyra-data.json
//  - На продакшене: Upstash Redis (бесплатный, 1 клик через Vercel KV)
//
// Переключение происходит автоматически по переменным окружения:
// если есть KV_REST_API_URL и KV_REST_API_TOKEN — используется Redis,
// иначе — файл.

import { Redis } from "@upstash/redis";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type RequestStatus = "new" | "in_progress" | "done" | "cancelled";

export type ServiceRequest = {
  id: string;
  name: string;
  contact: string;
  relativeName: string;
  cemetery: string;
  message: string;
  locale: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  notes: string;          // приватная заметка — видит только админ
  clientMessage: string;  // публичное сообщение — видит клиент на /track/[id]
};

// Старые записи в файле могли быть созданы до появления clientMessage —
// нормализуем при чтении, чтобы не падать.
function normalize(raw: Partial<ServiceRequest> & { id: string }): ServiceRequest {
  return {
    id: raw.id,
    name: raw.name ?? "",
    contact: raw.contact ?? "",
    relativeName: raw.relativeName ?? "",
    cemetery: raw.cemetery ?? "",
    message: raw.message ?? "",
    locale: raw.locale ?? "ru",
    status: (raw.status as RequestStatus) ?? "new",
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
    notes: raw.notes ?? "",
    clientMessage: raw.clientMessage ?? "",
  };
}

const FILE = path.join("/tmp", "hatyra-data.json");
const REQUESTS_KEY = "hatyra:requests:by_date";
const REQUEST_KEY = (id: string) => `hatyra:request:${id}`;

let _redis: Redis | null = null;
function redis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

export function isUsingRedis(): boolean {
  return redis() !== null;
}

// ───────── Файловый бекенд (локальная разработка) ─────────

function fileRead(): ServiceRequest[] {
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, "utf-8")) as Array<
      Partial<ServiceRequest> & { id: string }
    >;
    return raw.map(normalize);
  } catch {
    return [];
  }
}
function fileWrite(items: ServiceRequest[]) {
  fs.writeFileSync(FILE, JSON.stringify(items, null, 2));
}

// ───────── Публичный API ─────────

export async function listRequests(): Promise<ServiceRequest[]> {
  const r = redis();
  if (r) {
    const ids = (await r.zrange(REQUESTS_KEY, 0, -1, { rev: true })) as string[];
    if (!ids.length) return [];
    const items = (await r.mget(...ids.map(REQUEST_KEY))) as (
      | (Partial<ServiceRequest> & { id: string })
      | null
    )[];
    return items
      .filter((x): x is Partial<ServiceRequest> & { id: string } => x !== null)
      .map(normalize);
  }
  return fileRead().sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function getRequest(id: string): Promise<ServiceRequest | null> {
  const r = redis();
  if (r) {
    const raw = (await r.get(REQUEST_KEY(id))) as
      | (Partial<ServiceRequest> & { id: string })
      | null;
    return raw ? normalize(raw) : null;
  }
  return fileRead().find((x) => x.id === id) ?? null;
}

export async function createRequest(
  data: Omit<
    ServiceRequest,
    "id" | "status" | "createdAt" | "updatedAt" | "notes" | "clientMessage"
  >,
): Promise<ServiceRequest> {
  const now = new Date().toISOString();
  const item: ServiceRequest = {
    id: crypto.randomUUID(),
    ...data,
    status: "new",
    createdAt: now,
    updatedAt: now,
    notes: "",
    clientMessage: "",
  };
  const r = redis();
  if (r) {
    await r.set(REQUEST_KEY(item.id), item);
    await r.zadd(REQUESTS_KEY, { score: Date.now(), member: item.id });
  } else {
    const items = fileRead();
    items.unshift(item);
    fileWrite(items);
  }
  return item;
}

export async function updateRequest(
  id: string,
  patch: Partial<Pick<ServiceRequest, "status" | "notes" | "clientMessage">>,
): Promise<ServiceRequest | null> {
  const existing = await getRequest(id);
  if (!existing) return null;
  const updated: ServiceRequest = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  const r = redis();
  if (r) {
    await r.set(REQUEST_KEY(id), updated);
  } else {
    const items = fileRead();
    const idx = items.findIndex((x) => x.id === id);
    if (idx >= 0) {
      items[idx] = updated;
      fileWrite(items);
    }
  }
  return updated;
}

export async function deleteRequest(id: string): Promise<boolean> {
  const r = redis();
  if (r) {
    await r.del(REQUEST_KEY(id));
    await r.zrem(REQUESTS_KEY, id);
  } else {
    const items = fileRead().filter((x) => x.id !== id);
    fileWrite(items);
  }
  return true;
}

// Поиск заявок клиента по email. Используется на странице /find — клиент
// потерял ссылку на трекинг и хочет восстановить. Сравнение нечувствительно
// к регистру и пробелам.
export async function findRequestsByEmail(
  rawEmail: string,
): Promise<ServiceRequest[]> {
  const email = rawEmail.trim().toLowerCase();
  if (!email) return [];
  const all = await listRequests();
  return all.filter((item) => {
    const c = item.contact.toLowerCase();
    if (c === email) return true;
    // contact может быть смешанной строкой типа "+49 ... anna@example.com"
    const m = c.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    return m?.[0] === email;
  });
}

export async function countByStatus(): Promise<Record<RequestStatus, number>> {
  const items = await listRequests();
  const counts: Record<RequestStatus, number> = {
    new: 0,
    in_progress: 0,
    done: 0,
    cancelled: 0,
  };
  for (const item of items) counts[item.status]++;
  return counts;
}
