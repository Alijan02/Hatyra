"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Ошибка входа");
        setLoading(false);
        return;
      }
      router.push(from);
      router.refresh();
    } catch {
      setError("Сеть недоступна");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-card rounded-2xl p-8 border border-border shadow-sm"
      >
        <div className="font-display text-3xl text-foreground mb-2">Hatyra</div>
        <p className="text-sm text-foreground/60 mb-7">Вход в админ-панель</p>

        <label className="block text-sm text-foreground/70 mb-2" htmlFor="password">
          Пароль
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors mb-4"
          placeholder="••••••••"
        />

        {error && (
          <p
            role="alert"
            aria-live="assertive"
            className="text-sm text-red-600 mb-4"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 rounded-full bg-primary text-background hover:bg-primary/90 transition-colors font-medium disabled:opacity-60"
        >
          {loading ? "Входим..." : "Войти"}
        </button>

        <p className="mt-6 text-xs text-foreground/50 leading-relaxed">
          Пароль по умолчанию: <code className="font-mono">admin</code>.
          Поменяй его в файле <code className="font-mono">.env.local</code> через переменную <code className="font-mono">ADMIN_PASSWORD</code>.
        </p>
      </form>
    </div>
  );
}
