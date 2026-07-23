"use client";

import type { ChangeEvent } from "react";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import { useTheme, type ThemePreference } from "./ThemeProvider";
import styles from "./ThemeSwitcher.module.scss";

const ThemeSwitcher = () => {
  const { preference, setPreference } = useTheme();
  const { messages } = useI18n();
  const themeMessages = messages.common.theme;

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setPreference(event.target.value as ThemePreference);
  };

  return (
    <label className={styles.root}>
      <span aria-hidden="true">◐</span>
      <span className="visually-hidden">{themeMessages.label}</span>
      <select
        value={preference}
        onChange={handleChange}
        aria-label={themeMessages.label}
      >
        <option value="system">{themeMessages.system}</option>
        <option value="light">{themeMessages.light}</option>
        <option value="dark">{themeMessages.dark}</option>
      </select>
    </label>
  );
};

export default ThemeSwitcher;
