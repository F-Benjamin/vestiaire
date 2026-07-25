"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import { replacePathLocale } from "@/i18n/routing";
import {
  useTheme,
  type ThemePreference,
} from "@/components/theme/ThemeProvider";
import ProfileSection from "./ProfileSection";
import styles from "./ProfilePage.module.scss";

const themeOptions: ThemePreference[] = ["system", "light", "dark"];

const ProfilePreferences = () => {
  const pathname = usePathname();
  const { locale, messages } = useI18n();
  const { preference, setPreference } = useTheme();
  const copy = messages.profile;
  const themeLabels: Record<ThemePreference, string> = {
    system: copy.themeSystem,
    light: copy.themeLight,
    dark: copy.themeDark,
  };

  return (
    <ProfileSection
      id="preferences"
      title={copy.preferencesTitle}
      description={copy.preferencesDescription}
    >
      <div className={styles.preferenceGroup}>
        <div>
          <h3>{copy.theme}</h3>
          <div className={styles.segmentedControl}>
            {themeOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={preference === option ? styles.selectedOption : ""}
                aria-pressed={preference === option}
                onClick={() => setPreference(option)}
              >
                {themeLabels[option]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3>{copy.language}</h3>
          <div className={styles.segmentedControl}>
            <Link
              href={replacePathLocale(pathname, "fr")}
              hrefLang="fr"
              lang="fr"
              className={locale === "fr" ? styles.selectedOption : ""}
              aria-current={locale === "fr" ? "page" : undefined}
            >
              {copy.languageFrench}
            </Link>
            <Link
              href={replacePathLocale(pathname, "en")}
              hrefLang="en"
              lang="en"
              className={locale === "en" ? styles.selectedOption : ""}
              aria-current={locale === "en" ? "page" : undefined}
            >
              {copy.languageEnglish}
            </Link>
          </div>
        </div>
      </div>

      <p className={styles.helperNote}>{copy.localPreference}</p>
    </ProfileSection>
  );
};

export default ProfilePreferences;
