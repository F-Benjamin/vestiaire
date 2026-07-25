import "server-only";
import { after } from "next/server";
import { Resend } from "resend";
import { getDictionary } from "@/i18n/dictionaries";
import {
  detectLocale,
  isLocale,
  type Locale,
} from "@/i18n/routing";
import { getEmailEnvironment } from "@/lib/environment/email";

type AuthEmailKind = "reset-password" | "verify-email";

type QueueAuthEmailInput = {
  kind: AuthEmailKind;
  name: string;
  request?: Request;
  to: string;
  url: string;
};

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );

const getLocaleFromUrl = (url: string): Locale | undefined => {
  try {
    const parsedUrl = new URL(url);
    const callback =
      parsedUrl.searchParams.get("callbackURL") ??
      parsedUrl.searchParams.get("redirectTo");
    const pathname = callback
      ? new URL(callback, parsedUrl.origin).pathname
      : parsedUrl.pathname;
    const locale = pathname.split("/").filter(Boolean)[0];

    return locale && isLocale(locale) ? locale : undefined;
  } catch {
    return undefined;
  }
};

const resolveLocale = (url: string, request?: Request) =>
  getLocaleFromUrl(url) ??
  detectLocale(request?.headers.get("accept-language") ?? null);

const sendAuthEmail = async ({
  kind,
  name,
  request,
  to,
  url,
}: QueueAuthEmailInput) => {
  const locale = resolveLocale(url, request);
  const messages = await getDictionary(locale);
  const copy =
    kind === "verify-email"
      ? messages.authEmail.verification
      : messages.authEmail.passwordReset;
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(url);
  const { EMAIL_FROM, RESEND_API_KEY } = getEmailEnvironment();
  const resend = new Resend(RESEND_API_KEY);
  const greeting = copy.greeting.replace("{name}", name);
  const safeGreeting = copy.greeting.replace("{name}", safeName);

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: copy.subject,
    text: [
      greeting,
      "",
      copy.introduction,
      "",
      url,
      "",
      copy.expiration,
      copy.ignore,
      "",
      messages.authEmail.signature,
    ].join("\n"),
    html: `
      <div style="margin:0;background:#f5f3ed;padding:40px 16px;color:#18241f;font-family:Arial,sans-serif">
        <div style="max-width:560px;margin:0 auto;padding:36px;border:1px solid #d8d8cf;border-radius:20px;background:#ffffff">
          <p style="margin:0 0 28px;font-family:Georgia,serif;font-size:24px;font-weight:700">Vestiaire</p>
          <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:32px;line-height:1.15">${escapeHtml(copy.heading)}</h1>
          <p style="margin:0 0 12px;line-height:1.6">${safeGreeting}</p>
          <p style="margin:0 0 26px;line-height:1.6">${escapeHtml(copy.introduction)}</p>
          <p style="margin:0 0 28px">
            <a href="${safeUrl}" style="display:inline-block;padding:14px 20px;border-radius:10px;background:#18241f;color:#ffffff;font-weight:700;text-decoration:none">${escapeHtml(copy.action)}</a>
          </p>
          <p style="margin:0 0 8px;color:#66706b;font-size:14px;line-height:1.5">${escapeHtml(copy.expiration)}</p>
          <p style="margin:0;color:#66706b;font-size:14px;line-height:1.5">${escapeHtml(copy.ignore)}</p>
          <p style="margin:28px 0 0;padding-top:20px;border-top:1px solid #e5e5df;color:#66706b;font-size:13px">${escapeHtml(messages.authEmail.signature)}</p>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend a refusé l’e-mail (${error.name}).`);
  }
};

export const queueAuthEmail = (input: QueueAuthEmailInput) => {
  after(async () => {
    try {
      await sendAuthEmail(input);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur d’envoi inconnue";
      console.error(`[auth-email] ${input.kind}: ${message}`);
    }
  });
};
