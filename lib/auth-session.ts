import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLocalAdminSession } from "@/lib/auth-development";
import { localizePath, type Locale } from "@/i18n/routing";

export const getSession = cache(async () => {
  const requestHeaders = await headers();
  const localSession = getLocalAdminSession(requestHeaders.get("host"));
  if (localSession) return localSession;

  return auth.api.getSession({
    headers: requestHeaders,
  });
});

export const requireUser = async (locale: Locale, pathname: string) => {
  const session = await getSession();

  if (!session) {
    const signInPath = localizePath(locale, "/sign-in");
    redirect(`${signInPath}?callbackUrl=${encodeURIComponent(pathname)}`);
  }

  return session.user;
};
