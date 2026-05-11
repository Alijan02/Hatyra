"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ServiceRequest, RequestStatus } from "@/lib/storage";
import { StatusBadge, STATUS_LABELS } from "./status-badge";

const STATUSES: RequestStatus[] = ["new", "in_progress", "done", "cancelled"];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function whatsappLink(contact: string): string | null {
  const digits = contact.replace(/[^\d+]/g, "").replace(/^\+/, "");
  if (digits.length < 7) return null;
  return `https://wa.me/${digits}`;
}

export function RequestEditor({ item }: { item: ServiceRequest }) {
  const router = useRouter();
  const [status, setStatus] = useState<RequestStatus>(item.status);
  const [notes, setNotes] = useState(item.notes);
  const [clientMessage, setClientMessage] = useState(item.clientMessage);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const dirty =
    status !== item.status ||
    notes !== item.notes ||
    clientMessage !== item.clientMessage;

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/requests/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes, clientMessage }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Не удалось сохранить");
        setSaving(false);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    } catch {
      setError("Сеть недоступна");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Удалить эту заявку безвозвратно?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/requests/${item.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Не удалось удалить");
        setSaving(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Сеть недоступна");
      setSaving(false);
    }
  }

  const wa = whatsappLink(item.contact);
  const isEmail = item.contact.includes("@");

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Левая колонка — инфа о заявке */}
      <div className="space-y-6">
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl text-foreground mb-1">
                {item.name}
              </h1>
              <p className="text-sm text-foreground/60">
                Заявка от {formatDate(item.createdAt)}
              </p>
            </div>
            <StatusBadge status={item.status} />
          </div>

          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
            <Field label="Контакт">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{item.contact}</span>
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20"
                  >
                    WhatsApp ↗
                  </a>
                )}
                {isEmail && (
                  <a
                    href={`mailto:${item.contact}`}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-accent/10 text-accent hover:bg-accent/20"
                  >
                    Email ↗
                  </a>
                )}
              </div>
            </Field>

            <Field label="ФИО покойного">
              {item.relativeName || (
                <span className="text-foreground/40">—</span>
              )}
            </Field>

            <Field label="Кладбище / Город">{item.cemetery}</Field>
            <Field label="Язык">
              {item.locale === "ru"
                ? "Русский"
                : item.locale === "tk"
                ? "Türkmençe"
                : item.locale === "tr"
                ? "Türkçe"
                : "English"}
            </Field>
          </dl>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-xs uppercase tracking-wider text-foreground/50 mb-2">
              Сообщение клиента
            </div>
            <p className="text-foreground/85 whitespace-pre-wrap leading-relaxed">
              {item.message}
            </p>
          </div>
        </div>

        {/* Сообщение клиенту — публичное, видно на /track/[id] */}
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-wider text-amber-800">
              Сообщение клиенту (публичное)
            </div>
            <CopyTrackLinkButton id={item.id} copied={copied} setCopied={setCopied} />
          </div>
          <p className="text-xs text-amber-800/80 mb-3">
            Это сообщение клиент увидит на странице отслеживания заявки. Подходит,
            чтобы объяснить отмену, рассказать о ходе работ или передать ссылку на фото-отчёт.
          </p>
          <textarea
            value={clientMessage}
            onChange={(e) => setClientMessage(e.target.value)}
            rows={4}
            placeholder="Например: «К сожалению, не нашли могилу по указанным данным. Уточните дату захоронения и точное место, и мы попробуем снова.»"
            className="w-full px-4 py-3 rounded-xl bg-card border border-amber-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-colors resize-y"
          />
        </div>

        {/* Внутренние заметки — только для админа */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <div className="text-xs uppercase tracking-wider text-foreground/50 mb-3">
            Внутренние заметки (только для тебя)
          </div>
          <p className="text-xs text-foreground/55 mb-3">
            Клиент эти заметки не видит. Используй для напоминаний себе.
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Например: «Перезвонил, договорились на 5 мая. Нужно купить краску»"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors resize-y"
          />
        </div>
      </div>

      {/* Правая колонка — управление */}
      <aside className="space-y-4">
        <div className="bg-card rounded-2xl border border-border p-5 sticky top-20">
          <div className="text-xs uppercase tracking-wider text-foreground/50 mb-3">
            Статус
          </div>
          <div className="space-y-2 mb-5">
            {STATUSES.map((s) => (
              <label
                key={s}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  status === s
                    ? "bg-primary/10 border border-primary/30"
                    : "border border-transparent hover:bg-muted"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="accent-primary"
                />
                <span className="text-sm">{STATUS_LABELS[s]}</span>
              </label>
            ))}
          </div>

          <button
            onClick={save}
            disabled={!dirty || saving}
            className="w-full px-4 py-3 rounded-full bg-primary text-background hover:bg-primary/90 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Сохраняем..." : "Сохранить"}
          </button>

          {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
          {savedAt && !dirty && !error && (
            <p className="mt-3 text-xs text-green-700">Сохранено</p>
          )}

          <div className="mt-5 pt-5 border-t border-border">
            <button
              onClick={remove}
              disabled={saving}
              className="w-full text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
            >
              Удалить заявку
            </button>
          </div>
        </div>

        <div className="text-xs text-foreground/50 leading-relaxed px-1">
          <div className="mb-1">ID: <span className="font-mono">{item.id.slice(0, 8)}…</span></div>
          <div>Обновлено: {formatDate(item.updatedAt)}</div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-foreground/50 mb-1">
        {label}
      </dt>
      <dd className="text-foreground/90">{children}</dd>
    </div>
  );
}

function CopyTrackLinkButton({
  id,
  copied,
  setCopied,
}: {
  id: string;
  copied: boolean;
  setCopied: (v: boolean) => void;
}) {
  async function copy() {
    const url = `${window.location.origin}/track/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors"
      title="Скопировать ссылку для клиента"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Скопировано
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" />
          </svg>
          Ссылка для клиента
        </>
      )}
    </button>
  );
}