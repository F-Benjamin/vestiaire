import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProfilePage from "@/components/profile/ProfilePage";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, localizePath } from "@/i18n/routing";
import { requireUser } from "@/lib/auth-session";
import { countGarments } from "@/lib/repositories/garment-repository";
import { countOwnedWardrobeImages } from "@/lib/storage/wardrobe-image-store";

type ProfileRouteProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({
  params,
}: ProfileRouteProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getDictionary(locale);

  return {
    title: messages.metadata.profileTitle,
    description: messages.metadata.profileDescription,
  };
};

const ProfileRoute = async ({ params }: ProfileRouteProps) => {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await requireUser(locale, localizePath(locale, "/profile"));
  const [messages, garmentCount, imageCount] = await Promise.all([
    getDictionary(locale),
    countGarments(user.id),
    countOwnedWardrobeImages(user.id),
  ]);

  return (
    <ProfilePage
      copy={messages.profile}
      garmentCount={garmentCount}
      imageCount={imageCount}
      locale={locale}
      user={{
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
      }}
    />
  );
};

export default ProfileRoute;
