// Email-уведомления через Resend (https://resend.com).
// HTTP API напрямую — без SDK, чтобы не тащить лишнюю зависимость.
//
// Настройка (5 минут):
//   1. Зарегистрируйся на https://resend.com (бесплатно: 3000 писем/мес).
//   2. В разделе API Keys создай ключ.
//   3. В .env.local добавь:
//        RESEND_API_KEY=re_xxxxxxxx
//        EMAIL_FROM="Hatyra <onboarding@resend.dev>"
//      (onboarding@resend.dev — служебный домен Resend для тестов;
//       присылает письма только на твой собственный email из аккаунта.
//       Когда подключишь свой домен — поменяешь на noreply@hatyra.tm)
//
// Если RESEND_API_KEY не задан — модуль молча логирует письмо в консоль
// и возвращает true, чтобы локальная разработка не падала.

import type { ServiceRequest, RequestStatus } from "./storage";

const STATUS_RU: Record<RequestStatus, string> = {
  new: "Получена",
  in_progress: "Принята в работу",
  done: "Выполнена",
  cancelled: "Отменена",
};

const STATUS_EN: Record<RequestStatus, string> = {
  new: "Received",
  in_progress: "In progress",
  done: "Completed",
  cancelled: "Cancelled",
};

const STATUS_DESC_RU: Record<RequestStatus, string> = {
  new: "Мы получили вашу заявку и свяжемся в течение 24 часов.",
  in_progress: "Мы взяли вашу заявку в работу. Скоро отправим фото-отчёт.",
  done: "Работа выполнена. Если есть вопросы — напишите нам.",
  cancelled: "К сожалению, мы не смогли выполнить эту заявку. Подробности — в сообщении ниже.",
};

const STATUS_DESC_EN: Record<RequestStatus, string> = {
  new: "We've received your request and will be in touch within 24 hours.",
  in_progress: "We've started working on your request. The photo report will follow soon.",
  done: "The work is completed. If you have any questions — message us.",
  cancelled: "Unfortunately we couldn't fulfil this request. See the message below.",
};

// Грубая, но достаточная проверка — нам не нужно отлавливать все edge-cases.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function extractEmail(contact: string): string | null {
  const trimmed = contact.trim();
  if (EMAIL_RE.test(trimmed)) return trimmed;
  // Иногда люди пишут "anna@example.com или +49..." — попробуем найти email внутри строки
  const match = trimmed.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return match ? match[0] : null;
}

type StatusUpdatePayload = {
  to: string;
  item: ServiceRequest;
  baseUrl: string; // e.g. https://hatyra.com
  changedStatus: boolean;
  changedClientMessage: boolean;
};

export async function sendStatusUpdateEmail(
  payload: StatusUpdatePayload,
): Promise<boolean> {
  const ru = payload.item.locale !== "en";
  const STATUS = ru ? STATUS_RU : STATUS_EN;
  const DESC = ru ? STATUS_DESC_RU : STATUS_DESC_EN;
  const trackUrl = `${payload.baseUrl}/track/${payload.item.id}`;

  const subject = ru
    ? `Hatyra — Заявка ${shortId(payload.item.id)}: ${STATUS[payload.item.status]}`
    : `Hatyra — Request ${shortId(payload.item.id)}: ${STATUS[payload.item.status]}`;

  const html = renderHtmlTemplate({
    ru,
    name: payload.item.name,
    status: payload.item.status,
    statusLabel: STATUS[payload.item.status],
    statusDescription: DESC[payload.item.status],
    clientMessage: payload.item.clientMessage,
    requestId: shortId(payload.item.id),
    trackUrl,
    changedStatus: payload.changedStatus,
    changedClientMessage: payload.changedClientMessage,
  });

  return sendRaw({ to: payload.to, subject, html });
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

// ════════════════════════════════════════════════════════════════════════════
// Восстановление ссылок: "Я потерял ссылку → пришлите по email"
// ════════════════════════════════════════════════════════════════════════════

type RecoveryItem = {
  id: string;
  status: RequestStatus;
  cemetery: string;
  createdAt: string;
};

export async function sendRecoveryEmail({
  to,
  items,
  baseUrl,
  locale,
}: {
  to: string;
  items: RecoveryItem[];
  baseUrl: string;
  locale: string;
}): Promise<boolean> {
  const ru = locale !== "en";
  const STATUS = ru ? STATUS_RU : STATUS_EN;
  const subject = ru
    ? `Hatyra — Ваши заявки (${items.length})`
    : `Hatyra — Your requests (${items.length})`;

  const heading = ru ? "Ваши заявки" : "Your requests";
  const intro =
    items.length === 0
      ? ru
        ? "Мы получили запрос на восстановление ссылок, но по этому email не нашли ни одной заявки. Возможно, вы указывали другой email — попробуйте ещё раз. Или просто отправьте заявку заново."
        : "We received a recovery request but couldn't find any requests for this email. Try another email, or simply submit a new request."
      : ru
      ? `По вашему email мы нашли ${items.length === 1 ? "одну заявку" : items.length + " заявок(и)"}. Сохраните это письмо — здесь все ваши ссылки на отслеживание.`
      : `We found ${items.length === 1 ? "one request" : items.length + " requests"} for your email. Save this email — all your tracking links are below.`;
  const buttonLabel = ru ? "Открыть заявку" : "Open request";
  const submitNew = ru ? "Отправить новую заявку" : "Submit a new request";

  const itemsHtml = items
    .map((it) => {
      const trackUrl = `${baseUrl}/track/${it.id}`;
      const date = new Date(it.createdAt).toLocaleDateString(
        ru ? "ru-RU" : "en-US",
        { day: "2-digit", month: "long", year: "numeric" },
      );
      return `
        <tr><td style="padding-top: 14px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #fbf6e8; border: 1px solid #ece6d6; border-radius: 12px;">
            <tr><td style="padding: 16px 18px;">
              <div style="font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #8a7a5b;">
                #${escape(shortId(it.id))} · ${escape(date)}
              </div>
              <div style="font-family: Georgia, serif; font-size: 17px; color: #2a2620; margin-top: 4px;">
                ${escape(it.cemetery)}
              </div>
              <div style="font-size: 13px; color: #555149; margin-top: 4px;">
                ${escape(STATUS[it.status])}
              </div>
              <div style="margin-top: 10px;">
                <a href="${escapeAttr(trackUrl)}" style="display: inline-block; background: #3b5043; color: #f5efe1; text-decoration: none; padding: 8px 16px; border-radius: 999px; font-size: 13px;">
                  ${buttonLabel}
                </a>
              </div>
            </td></tr>
          </table>
        </td></tr>
      `;
    })
    .join("");

  const newRequestBlock = `
    <tr><td style="padding-top: 24px; text-align: center;">
      <a href="${escapeAttr(baseUrl + "/#contact")}" style="font-size: 13px; color: #8a7a5b; text-decoration: underline;">
        ${submitNew}
      </a>
    </td></tr>
  `;

  const html = `<!DOCTYPE html>
<html lang="${ru ? "ru" : "en"}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${heading}</title></head>
<body style="margin: 0; padding: 0; background: #f5efe1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2a2620;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px;">
      <tr><td style="padding: 8px 0 24px 0;">
        <div style="font-family: Georgia, serif; font-size: 30px;">Hatyra</div>
        <div style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #8a7a5b; margin-top: 4px;">${heading}</div>
      </td></tr>
      <tr><td style="background: #ffffff; border-radius: 16px; padding: 28px;">
        <div style="font-size: 15px; color: #555149; line-height: 1.55;">${escape(intro)}</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${itemsHtml}
        </table>
        ${items.length === 0 ? newRequestBlock : ""}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  return sendRaw({ to, subject, html });
}

async function sendRaw({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Hatyra <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(
      `[email] RESEND_API_KEY не задан, письмо не отправлено. To: ${to}, subject: ${subject}`,
    );
    return true; // не считаем это ошибкой — локально это нормально
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[email] Resend failed: ${res.status} ${text}`);
      return false;
    }
    console.log(`[email] sent to ${to} — ${subject}`);
    return true;
  } catch (err) {
    console.error("[email] Resend network error:", err);
    return false;
  }
}

function renderHtmlTemplate({
  ru,
  name,
  status,
  statusLabel,
  statusDescription,
  clientMessage,
  requestId,
  trackUrl,
  changedStatus,
  changedClientMessage,
}: {
  ru: boolean;
  name: string;
  status: RequestStatus;
  statusLabel: string;
  statusDescription: string;
  clientMessage: string;
  requestId: string;
  trackUrl: string;
  changedStatus: boolean;
  changedClientMessage: boolean;
}): string {
  const heading = ru ? "Обновление по вашей заявке" : "Update on your request";
  const greeting = ru ? `Здравствуйте, ${escape(name)}.` : `Hello, ${escape(name)}.`;
  const intro = changedStatus && changedClientMessage
    ? ru
      ? "У вашей заявки изменился статус и есть сообщение от нас."
      : "Your request status has been updated and we've left you a message."
    : changedStatus
    ? ru
      ? "У вашей заявки изменился статус."
      : "Your request status has been updated."
    : ru
    ? "У нас есть сообщение для вас по вашей заявке."
    : "We have a message for you about your request.";

  const messageBlock = clientMessage
    ? `
      <tr><td style="padding-top: 24px;">
        <div style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #8a7a5b; margin-bottom: 8px;">
          ${ru ? "Сообщение от нас" : "Message from us"}
        </div>
        <div style="background: #fffbeb; border: 1px solid #fbeec1; border-radius: 12px; padding: 16px 18px; color: #2a2620; line-height: 1.55; white-space: pre-wrap;">
          ${escape(clientMessage)}
        </div>
      </td></tr>
    `
    : "";

  const statusColor: Record<RequestStatus, string> = {
    new: "#1d4ed8",
    in_progress: "#b45309",
    done: "#15803d",
    cancelled: "#525252",
  };
  const statusBg: Record<RequestStatus, string> = {
    new: "#dbeafe",
    in_progress: "#fef3c7",
    done: "#dcfce7",
    cancelled: "#f4f4f5",
  };

  const requestLabel = ru ? "Номер заявки" : "Request number";
  const buttonLabel = ru ? "Открыть страницу заявки" : "Open request page";
  const footerText = ru
    ? "Это автоматическое уведомление. Чтобы написать нам — нажмите кнопку выше или ответьте через WhatsApp / Telegram."
    : "This is an automated notification. To reply — open the request page above or message us on WhatsApp / Telegram.";

  return `<!DOCTYPE html>
<html lang="${ru ? "ru" : "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${heading}</title>
</head>
<body style="margin: 0; padding: 0; background: #f5efe1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2a2620;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px;">
      <tr><td style="padding: 8px 0 24px 0;">
        <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 30px; color: #2a2620;">Hatyra</div>
        <div style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #8a7a5b; margin-top: 4px;">
          ${heading}
        </div>
      </td></tr>

      <tr><td style="background: #ffffff; border-radius: 16px; padding: 28px 28px 32px 28px;">
        <div style="font-size: 16px; color: #2a2620; margin-bottom: 12px;">${greeting}</div>
        <div style="font-size: 15px; color: #555149; line-height: 1.55; margin-bottom: 24px;">${intro}</div>

        <div style="background: ${statusBg[status]}; color: ${statusColor[status]}; padding: 18px 20px; border-radius: 12px;">
          <div style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.7; margin-bottom: 4px;">
            ${ru ? "Статус" : "Status"}
          </div>
          <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; line-height: 1.25;">
            ${escape(statusLabel)}
          </div>
          <div style="font-size: 14px; line-height: 1.5; margin-top: 8px; opacity: 0.85;">
            ${escape(statusDescription)}
          </div>
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${messageBlock}
        </table>

        <div style="margin-top: 28px; text-align: center;">
          <a href="${escapeAttr(trackUrl)}" style="display: inline-block; background: #3b5043; color: #f5efe1; text-decoration: none; padding: 14px 26px; border-radius: 999px; font-size: 15px; font-weight: 500;">
            ${buttonLabel}
          </a>
        </div>

        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #ece6d6; font-size: 12px; color: #8a7a5b;">
          <div style="margin-bottom: 6px;">
            ${requestLabel}: <span style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">#${escape(requestId)}</span>
          </div>
          <div>${escape(footerText)}</div>
        </div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ════════════════════════════════════════════════════════════════════════════
// Magic-link для входа в личный кабинет /me
// ════════════════════════════════════════════════════════════════════════════

export async function sendMagicLinkEmail({
  to,
  link,
  baseUrl: _baseUrl,
  locale,
}: {
  to: string;
  link: string;
  baseUrl: string;
  locale: string;
}): Promise<boolean> {
  const ru = locale !== "en";
  const subject = ru
    ? "Hatyra — Вход в личный кабинет"
    : "Hatyra — Sign in to your account";

  const heading = ru ? "Вход в личный кабинет" : "Sign in to your account";
  const intro = ru
    ? "Нажмите на кнопку ниже, чтобы войти в свой личный кабинет на Hatyra. Ссылка действует 30 минут."
    : "Click the button below to sign in to your Hatyra account. The link is valid for 30 minutes.";
  const button = ru ? "Войти в кабинет" : "Sign in";
  const fallback = ru
    ? "Не нажимали? Просто проигнорируйте это письмо."
    : "Didn't request this? Just ignore this email.";
  const linkLabel = ru ? "Или скопируйте ссылку:" : "Or copy the link:";

  const html = `<!DOCTYPE html>
<html lang="${ru ? "ru" : "en"}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${heading}</title></head>
<body style="margin:0;padding:0;background:#f5efe1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2a2620;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
      <tr><td style="padding:8px 0 24px 0;">
        <div style="font-family:Georgia,serif;font-size:30px;">Hatyra</div>
        <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#8a7a5b;margin-top:4px;">${heading}</div>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:16px;padding:32px;">
        <p style="font-size:15px;line-height:1.55;color:#555149;margin:0 0 24px 0;">${escape(intro)}</p>
        <div style="text-align:center;margin:0 0 24px 0;">
          <a href="${escapeAttr(link)}" style="display:inline-block;background:#3b5043;color:#f5efe1;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;font-weight:500;">
            ${button}
          </a>
        </div>
        <p style="font-size:12px;color:#8a7a5b;margin:0 0 8px 0;">${escape(linkLabel)}</p>
        <p style="font-size:12px;color:#8a7a5b;margin:0 0 24px 0;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">
          ${escape(link)}
        </p>
        <p style="font-size:12px;color:#8a7a5b;margin:0;border-top:1px solid #ece6d6;padding-top:16px;">${escape(fallback)}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  return sendRaw({ to, subject, html });
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string): string {
  return escape(s);
}
