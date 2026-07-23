"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  locales,
  replacePathLocale,
  type Locale,
} from "@/i18n/routing";
import { useI18n } from "./LocalizationProvider";
import styles from "./LocaleSwitcher.module.scss";

const localeNames: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
};

const LocaleSwitcher = () => {
  const pathname = usePathname();
  const { locale, messages } = useI18n();

  return (
    <nav className={styles.root} aria-label={messages.common.language}>
      {locales.map((availableLocale) => (
        <Link
          key={availableLocale}
          href={replacePathLocale(pathname, availableLocale)}
          hrefLang={availableLocale}
          lang={availableLocale}
          aria-current={locale === availableLocale ? "page" : undefined}
          className={locale === availableLocale ? styles.active : undefined}
        >
          {localeNames[availableLocale]}
        </Link>
      ))}
    </nav>
  );
};

export default LocaleSwitcher;
