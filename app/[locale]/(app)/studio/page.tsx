import type { Metadata } from "next";
import StudioView from "@/components/wardrobe/StudioView";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/routing";

type StudioPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ piece?: string | string[] }>;
};

export const generateMetadata = async ({
  params,
}: Pick<StudioPageProps, "params">): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getDictionary(locale);

  return {
    title: messages.metadata.studioTitle,
    description: messages.metadata.studioDescription,
  };
};

const StudioPage = async ({ searchParams }: StudioPageProps) => {
  const { piece } = await searchParams;
  const requestedItemId = Array.isArray(piece) ? piece[0] : piece;

  return <StudioView requestedItemId={requestedItemId} />;
};

export default StudioPage;
