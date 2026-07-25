import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import AuthPage from "@/components/auth/AuthPage";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, localizePath } from "@/i18n/routing";
import { getSession } from "@/lib/auth-session";

type SignInPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    callbackUrl?: string | string[];
    registered?: string | string[];
  }>;
};

export const generateMetadata = async ({
  params,
}: Pick<SignInPageProps, "params">): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getDictionary(locale);

  return {
    title: messages.metadata.signInTitle,
    description: messages.metadata.signInDescription,
  };
};

const SignInPage = async ({ params, searchParams }: SignInPageProps) => {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const session = await getSession();
  if (session) redirect(localizePath(locale, "/wardrobe"));

  const query = await searchParams;
  const requestedCallback = Array.isArray(query.callbackUrl)
    ? query.callbackUrl[0]
    : query.callbackUrl;
  const callbackUrl =
    requestedCallback?.startsWith(`/${locale}/`) &&
    !requestedCallback.startsWith("//")
      ? requestedCallback
      : undefined;
  const registeredValue = Array.isArray(query.registered)
    ? query.registered[0]
    : query.registered;

  return (
    <AuthPage
      mode="sign-in"
      callbackUrl={callbackUrl}
      registered={registeredValue === "1"}
    />
  );
};

export default SignInPage;
