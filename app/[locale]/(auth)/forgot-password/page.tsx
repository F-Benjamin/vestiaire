import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PasswordRecoveryPage from "@/components/auth/PasswordRecoveryPage";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, localizePath } from "@/i18n/routing";
import { getSession } from "@/lib/auth-session";
import { isEmailAuthEnabled } from "@/lib/environment/email";

type ForgotPasswordPageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({
  params,
}: ForgotPasswordPageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getDictionary(locale);

  return {
    title: messages.metadata.forgotPasswordTitle,
    description: messages.metadata.forgotPasswordDescription,
  };
};

const ForgotPasswordPage = async ({ params }: ForgotPasswordPageProps) => {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const session = await getSession();
  if (session) redirect(localizePath(locale, "/wardrobe"));

  return (
    <PasswordRecoveryPage
      mode="forgot-password"
      emailAuthEnabled={isEmailAuthEnabled()}
    />
  );
};

export default ForgotPasswordPage;
