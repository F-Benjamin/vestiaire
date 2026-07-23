import type { Metadata } from "next";
import WardrobeView from "@/components/wardrobe/WardrobeView";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/routing";

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

const WardrobePage = () => <WardrobeView />;

export default WardrobePage;
