import { Suspense } from "react";
import { AdminLoginForm } from "./login-form";

export const metadata = {
  title: "Hatyra — Вход в админ-панель",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
