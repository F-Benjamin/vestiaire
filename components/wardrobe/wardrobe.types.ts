import type { ChangeEvent, Dispatch, SetStateAction } from "react";

export type Category =
  (typeof import("./wardrobe.constants").categories)[number];
export type Season =
  (typeof import("./wardrobe.constants").seasons)[number];
export type WardrobeStyle =
  (typeof import("./wardrobe.constants").wardrobeStyles)[number];
export type Pattern =
  (typeof import("./wardrobe.constants").patterns)[number];
export type AttributeKey = "colors" | "seasons" | "styles" | "patterns";

export type AnalysisAttribute<T> = {
  values: T[];
  confidence: number;
};

export type GarmentAnalysis = {
  source: "openai" | "filename";
  model: string | null;
  analyzedAt: string;
  attributes: {
    category?: {
      value: Category;
      confidence: number;
    };
    colors?: AnalysisAttribute<string>;
    seasons?: AnalysisAttribute<Season>;
    styles?: AnalysisAttribute<WardrobeStyle>;
    patterns?: AnalysisAttribute<Pattern>;
  };
};

export type WardrobeItem = {
  id: string;
  name: string;
  category: Category;
  colors: string[];
  seasons: Season[];
  styles: WardrobeStyle[];
  patterns: Pattern[];
  analysis?: GarmentAnalysis;
  imageKey: string | null;
  imageUrl: string | null;
};

export type WardrobeItemPatch = Partial<
  Pick<
    WardrobeItem,
    | "name"
    | "category"
    | "colors"
    | "seasons"
    | "styles"
    | "patterns"
    | "imageKey"
  >
>;

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
  isUploading: boolean;
  importPhotos: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  updateItem: (id: string, patch: WardrobeItemPatch) => void;
  removeItem: (id: string) => void;
  toggleAttribute: <K extends AttributeKey>(
    id: string,
    key: K,
    value: WardrobeItem[K][number],
  ) => void;
  createOutfit: (anchorId?: string) => void;
};
