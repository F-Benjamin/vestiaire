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

export type GarmentCutout = {
  status: "pending" | "ready" | "failed" | "unavailable" | "accepted";
  imageKey?: string;
  confidence?: number;
  failureReason?:
    | "not_configured"
    | "request_failed"
    | "provider_failed"
    | "download_failed";
  failureCode?: string;
  failureDetail?: string;
  createdAt: string;
  completedAt?: string;
  failureAt?: string;
  acceptedAt?: string;
  originalDeleteAfter?: string;
  originalDeletedAt?: string;
};

export type UploadProgress = {
  current: number;
  total: number;
  step: "optimizing" | "analyzing" | "uploading" | "saving" | "cutout";
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
  originalImageKey?: string | null;
  cutout?: GarmentCutout;
  imageUrl: string | null;
  originalImageUrl?: string | null;
  cutoutImageUrl?: string | null;
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
  uploadProgress: UploadProgress | null;
  importPhotos: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  updateItem: (id: string, patch: WardrobeItemPatch) => void;
  removeItem: (id: string) => void;
  acceptCutout: (id: string) => void;
  restoreOriginal: (id: string) => void;
  requestCutout: (id: string) => void;
  toggleAttribute: <K extends AttributeKey>(
    id: string,
    key: K,
    value: WardrobeItem[K][number],
  ) => void;
  createOutfit: (anchorId?: string) => void;
};
