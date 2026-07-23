"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Messages } from "@/i18n/dictionaries/fr";
import { localizePath, type Locale } from "@/i18n/routing";

type LocalizationContextValue = {
  locale: Locale;
  messages: Messages;
  href: (path?: string) => string;
};

const LocalizationContext =
  createContext<LocalizationContextValue | null>(null);

type LocalizationProviderProps = {
  children: ReactNode;
  locale: Locale;
  messages: Messages;
};

export const LocalizationProvider = ({
  children,
  locale,
  messages,
}: LocalizationProviderProps) => {
  const value = useMemo<LocalizationContextValue>(
    () => ({
      locale,
      messages,
      href: (path = "/") => localizePath(locale, path),
    }),
    [locale, messages],
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useI18n must be used inside LocalizationProvider.");
  }
  return context;
};
