import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { localizePath, type Locale } from "@/i18n/routing";

export const getSession = cache(async () =>
  auth.api.getSession({
    headers: await headers(),
  }),
);

export const requireUser = async (locale: Locale, pathname: string) => {
  const session = await getSession();

  if (!session) {
    const signInPath = localizePath(locale, "/sign-in");
    redirect(`${signInPath}?callbackUrl=${encodeURIComponent(pathname)}`);
  }

  return session.user;
};
