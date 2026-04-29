import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Hatyra — Админ-панель",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-muted/30">{children}</div>;
}
