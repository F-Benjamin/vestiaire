import "server-only";
import { apiError } from "@/lib/api/json-response";
import { getDictionary } from "@/i18n/dictionaries";
import { detectLocale } from "@/i18n/routing";

export const ensureSameOrigin = async (request: Request) => {
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto");
  const requestOrigin =
    forwardedHost && forwardedProtocol
      ? `${forwardedProtocol}://${forwardedHost}`
      : requestUrl.origin;

  if (origin === requestOrigin) {
    return null;
  }

  const locale = detectLocale(request.headers.get("accept-language"));
  const messages = (await getDictionary(locale)).api;

  return apiError(403, "FORBIDDEN", messages.forbidden);
};
