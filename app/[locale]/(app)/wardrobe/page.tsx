import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WardrobeView from "@/components/wardrobe/WardrobeView";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, localizePath } from "@/i18n/routing";
import { requireUser } from "@/lib/auth-session";

type WardrobePageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({
  params,
}: WardrobePageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getDictionary(locale);

  return {
    title: messages.metadata.wardrobeTitle,
    description: messages.metadata.wardrobeDescription,
  };
};

const WardrobePage = async ({ params }: WardrobePageProps) => {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireUser(locale, localizePath(locale, "/wardrobe"));

  return <WardrobeView />;
};

export default WardrobePage;
