import type { Metadata } from "next";
import LandingPage from "@/components/marketing/LandingPage";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({
  params,
}: HomePageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getDictionary(locale);

  return {
    title: messages.metadata.homeTitle,
    description: messages.metadata.homeDescription,
  };
};

const HomePage = async ({ params }: HomePageProps) => {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = await getDictionary(locale);

  return <LandingPage locale={locale} messages={messages} />;
};

export default HomePage;
