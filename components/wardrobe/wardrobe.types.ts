import type { ChangeEvent, Dispatch, SetStateAction } from "react";

export type Category = "Hauts" | "Bas" | "Robes" | "Vestes" | "Chaussures" | "Accessoires";
export type Season = "Toute saison" | "Printemps" | "Été" | "Automne" | "Hiver";
export type WardrobeStyle = "Décontracté" | "Chic" | "Créatif" | "Minimal" | "Travail";
export type Pattern = "Uni" | "Rayures" | "Carreaux" | "Fleurs" | "Pois" | "Graphique" | "Animal" | "Texturé";
export type AttributeKey = "colors" | "seasons" | "styles" | "patterns";

export type WardrobeItem = {
  id: string;
  name: string;
  category: Category;
  colors: string[];
  seasons: Season[];
  styles: WardrobeStyle[];
  patterns: Pattern[];
  image: string;
};

export type LegacyWardrobeItem = WardrobeItem & {
  color?: string;
  season?: Season;
  style?: WardrobeStyle;
};

export type WardrobeContextValue = {
  items: WardrobeItem[];
  visibleItems: WardrobeItem[];
  category: "Tout" | Category;
  setCategory: Dispatch<SetStateAction<"Tout" | Category>>;
  selectedId: string;
  setSelectedId: Dispatch<SetStateAction<string>>;
  selected?: WardrobeItem;
  wantedStyle: WardrobeStyle;
  setWantedStyle: Dispatch<SetStateAction<WardrobeStyle>>;
  outfit: WardrobeItem[];
  notice: string;
  setNotice: Dispatch<SetStateAction<string>>;
  importPhotos: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  updateItem: (id: string, patch: Partial<WardrobeItem>) => void;
  removeItem: (id: string) => void;
  toggleAttribute: <K extends AttributeKey>(
    id: string,
    key: K,
    value: WardrobeItem[K][number],
  ) => void;
  createOutfit: (anchorId?: string) => void;
};
