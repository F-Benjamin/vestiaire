import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StudioView from "@/components/wardrobe/StudioView";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, localizePath } from "@/i18n/routing";
import { requireUser } from "@/lib/auth-session";

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

const StudioPage = async ({ params, searchParams }: StudioPageProps) => {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { piece } = await searchParams;
  const requestedItemId = Array.isArray(piece) ? piece[0] : piece;
  const studioPath = requestedItemId
    ? `${localizePath(locale, "/studio")}?piece=${encodeURIComponent(requestedItemId)}`
    : localizePath(locale, "/studio");

  await requireUser(locale, studioPath);

  return <StudioView requestedItemId={requestedItemId} />;
};

export default StudioPage;
