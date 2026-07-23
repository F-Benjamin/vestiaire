import type { Metadata } from "next";
import Script from "next/script";
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

  return {
    title: messages.metadata.rootTitle,
    description: messages.metadata.rootDescription,
  };
};

const themeInitializationScript = `
(() => {
  try {
    const stored = localStorage.getItem("vestiaire-theme");
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
          id="vestiaire-theme"
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
