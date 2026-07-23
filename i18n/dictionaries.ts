import "server-only";
import type { Locale } from "./routing";
import type { Messages } from "./dictionaries/fr";

const dictionaries: Record<Locale, () => Promise<Messages>> = {
  fr: () => import("./dictionaries/fr").then((module) => module.fr),
  en: () => import("./dictionaries/en").then((module) => module.en),
};

export const getDictionary = (locale: Locale) => dictionaries[locale]();
