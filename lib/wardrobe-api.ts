import type {
  Category,
  Pattern,
  Season,
  WardrobeItem,
  WardrobeItemPatch,
  WardrobeStyle,
} from "@/components/wardrobe/wardrobe.types";

type GarmentAnalysis = WardrobeItem["analysis"];

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

type GarmentInput = {
  name: string;
  category: Category;
  colors: string[];
  seasons: Season[];
  styles: WardrobeStyle[];
  patterns: Pattern[];
  imageKey: string | null;
  analysis?: GarmentAnalysis;
};

type GarmentSuggestion = {
  category: Category;
  colors: string[];
  seasons: Season[];
  styles: WardrobeStyle[];
  patterns: Pattern[];
  analysis: NonNullable<GarmentAnalysis>;
};

type ImageUpload = {
  key: string;
  url: string;
  contentType: string;
  size: number;
};

export class WardrobeApiError extends Error {
  constructor(
    message: string,
    public readonly code = "UNKNOWN_ERROR",
    public readonly status = 0,
  ) {
    super(message);
    this.name = "WardrobeApiError";
  }
}

const readError = async (response: Response) => {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return new WardrobeApiError(
    body?.error?.message ?? response.statusText,
    body?.error?.code,
    response.status,
  );
};

const readData = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw await readError(response);
  }

  const body = (await response.json()) as { data: T };
  return body.data;
};

export const listGarments = async () =>
  readData<WardrobeItem[]>(
    await fetch("/api/garments", {
      cache: "no-store",
    }),
  );

export const createGarment = async (input: GarmentInput) =>
  readData<WardrobeItem>(
    await fetch("/api/garments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );

export const updateGarment = async (
  id: string,
  patch: WardrobeItemPatch,
) =>
  readData<WardrobeItem>(
    await fetch(`/api/garments/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }),
  );

export const requestGarmentCutout = async (id: string) =>
  readData<WardrobeItem>(
    await fetch(`/api/garments/${encodeURIComponent(id)}/cutout`, {
      method: "POST",
    }),
  );

export const acceptGarmentCutout = async (id: string) =>
  readData<WardrobeItem>(
    await fetch(`/api/garments/${encodeURIComponent(id)}/cutout/accept`, {
      method: "POST",
    }),
  );

export const deleteGarment = async (id: string) => {
  const response = await fetch(`/api/garments/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await readError(response);
  }
};

export const uploadWardrobeImage = async (file: File) => {
  const formData = new FormData();
  formData.set("file", file);

  return readData<ImageUpload>(
    await fetch("/api/wardrobe-images", {
      method: "POST",
      body: formData,
    }),
  );
};

export const analyzeWardrobeImage = async (file: File) => {
  const formData = new FormData();
  formData.set("filename", file.name);
  formData.set("image", file);

  return readData<GarmentSuggestion>(
    await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    }),
  );
};

export const deleteWardrobeImage = async (key: string) => {
  const response = await fetch(`/api/wardrobe-images/${key}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await readError(response);
  }
};
