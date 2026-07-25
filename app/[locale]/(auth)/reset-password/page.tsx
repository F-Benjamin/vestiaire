import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PasswordRecoveryPage from "@/components/auth/PasswordRecoveryPage";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, localizePath } from "@/i18n/routing";
import { getSession } from "@/lib/auth-session";
import { isEmailAuthEnabled } from "@/lib/environment/email";

type ResetPasswordPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    error?: string | string[];
    token?: string | string[];
  }>;
};

export const generateMetadata = async ({
  params,
}: Pick<ResetPasswordPageProps, "params">): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getDictionary(locale);

  return {
    title: messages.metadata.resetPasswordTitle,
    description: messages.metadata.resetPasswordDescription,
  };
};

const ResetPasswordPage = async ({
  params,
  searchParams,
}: ResetPasswordPageProps) => {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const session = await getSession();
  if (session) redirect(localizePath(locale, "/wardrobe"));

  const query = await searchParams;
  const token = Array.isArray(query.token) ? query.token[0] : query.token;
  const error = Array.isArray(query.error) ? query.error[0] : query.error;

  return (
    <PasswordRecoveryPage
      mode="reset-password"
      emailAuthEnabled={isEmailAuthEnabled()}
      invalidToken={Boolean(error)}
      token={token}
    />
  );
};

export default ResetPasswordPage;
