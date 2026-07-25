import type { Metadata } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { LocalizationProvider } from "@/components/i18n/LocalizationProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/routing";
import "../globals.scss";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export const generateStaticParams = () =>
  locales.map((locale) => ({ locale }));

export const generateMetadata = async ({
  params,
}: Pick<LocaleLayoutProps, "params">): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getDictionary(locale);
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: messages.metadata.rootTitle,
    description: messages.metadata.rootDescription,
    icons: {
      icon: "/favicon.svg",
    },
    openGraph: {
      type: "website",
      title: messages.metadata.homeTitle,
      description: messages.metadata.homeDescription,
      images: [
        {
          url: new URL("/og.png", metadataBase),
          width: 1734,
          height: 907,
          alt: messages.metadata.homeTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: messages.metadata.homeTitle,
      description: messages.metadata.homeDescription,
      images: [new URL("/og.png", metadataBase)],
    },
  };
};

const themeInitializationScript = `
(() => {
  try {
    const stored = localStorage.getItem("wearsona-theme") ?? localStorage.getItem("vestiaire-theme");
    const preference = ["light", "dark", "system"].includes(stored) ? stored : "system";
    const resolved = preference === "system"
      ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : preference;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = preference;
  } catch {
    document.documentElement.dataset.theme =
      matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.themePreference = "system";
  }
})();
`;

const RootLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = await getDictionary(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <Script
          id="wearsona-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitializationScript }}
        />
        <LocalizationProvider locale={locale} messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
};

export default RootLayout;
