import { FindClient } from "./find-client";

export const metadata = {
  title: "Hatyra — Найти мои заявки",
  robots: { index: false, follow: false },
};

export default function FindPage() {
  return <FindClient />;
}
