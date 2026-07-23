export const locales = ["fr", "en"] as const;
export const defaultLocale = "fr";

export type Locale = (typeof locales)[number];

export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);

export const detectLocale = (acceptLanguage: string | null): Locale => {
  if (!acceptLanguage) return defaultLocale;

  const requestedLanguages = acceptLanguage
    .split(",")
    .map((entry) => {
      const [language, quality = "q=1"] = entry.trim().split(";");
      return {
        language: language.toLowerCase(),
        quality: Number(quality.replace("q=", "")) || 0,
      };
    })
    .sort((first, second) => second.quality - first.quality);

  for (const requested of requestedLanguages) {
    const match = locales.find(
      (locale) =>
        requested.language === locale ||
        requested.language.startsWith(`${locale}-`),
    );
    if (match) return match;
  }

  return defaultLocale;
};

export const localizePath = (locale: Locale, path = "/") =>
  `/${locale}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`;

export const replacePathLocale = (pathname: string, locale: Locale) => {
  const segments = pathname.split("/");
  if (isLocale(segments[1] ?? "")) segments[1] = locale;
  else segments.splice(1, 0, locale);
  return segments.join("/") || `/${locale}`;
};
