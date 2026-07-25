import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import AuthPage from "@/components/auth/AuthPage";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, localizePath } from "@/i18n/routing";
import { getSession } from "@/lib/auth-session";
import { isEmailAuthEnabled } from "@/lib/environment/email";

type SignUpPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    callbackUrl?: string | string[];
  }>;
};

export const generateMetadata = async ({
  params,
}: SignUpPageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getDictionary(locale);

  return {
    title: messages.metadata.signUpTitle,
    description: messages.metadata.signUpDescription,
  };
};

const SignUpPage = async ({ params, searchParams }: SignUpPageProps) => {
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

  return (
    <AuthPage
      mode="sign-up"
      callbackUrl={callbackUrl}
      emailAuthEnabled={isEmailAuthEnabled()}
    />
  );
};

export default SignUpPage;
