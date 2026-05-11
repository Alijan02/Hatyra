"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export function AdminShell({
  children,
  storageMode,
}: {
  children: React.ReactNode;
  storageMode: "file" | "redis";
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-display text-2xl text-foreground"
            >
              Hatyra
            </Link>
            <span className="text-xs uppercase tracking-widest text-foreground/50 hidden sm:inline">
              Админ-панель
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`hidden sm:inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full ${
                storageMode === "redis"
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  storageMode === "redis" ? "bg-green-500" : "bg-amber-500"
                }`}
              />
              {storageMode === "redis"
                ? "Redis (продакшен)"
                : "Файл (локально)"}
            </span>
            <a
              href="/"
              target="_blank"
              className="text-sm text-foreground/70 hover:text-foreground"
            >
              Открыть сайт ↗
            </a>
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8">{children}</main>
    </>
  );
}
