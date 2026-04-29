"use client";

import { contacts } from "@/lib/content";

export function FloatingWhatsApp() {
  return (
    <a
      href={`https://wa.me/${contacts.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 hover:scale-105 transition-transform"
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 1.9 6.5L4 29l7.7-2c1.8 1 3.9 1.5 6.3 1.5h.1c6.6 0 12-5.4 12-12s-5.5-13.5-14.1-13.5Zm0 22.6c-2 0-4-.5-5.7-1.5l-.4-.2-4.6 1.2 1.2-4.5-.3-.5C5.2 18.6 4.5 16.8 4.5 15c0-5.8 4.7-10.5 10.5-10.5S25.5 9.2 25.5 15 20.8 25.5 16 25.5Zm5.7-7.8c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0c-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.5-.6.2-.2.2-.3.3-.5s0-.4 0-.5c-.1-.2-.7-1.7-1-2.3s-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1 2.8 1.2 3 2 3.1 4.9 4.3c.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 2-1.4.2-.7.2-1.2.1-1.4 0-.2-.3-.3-.6-.4Z" />
      </svg>
    </a>
  );
}
