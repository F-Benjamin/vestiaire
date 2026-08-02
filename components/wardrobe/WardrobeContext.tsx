"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import { formatMessage } from "@/i18n/format";
import { buildOutfit, guessCategory } from "@/lib/wardrobe";
import {
  createGarment as createGarmentRequest,
  acceptGarmentCutout as acceptGarmentCutoutRequest,
  analyzeWardrobeImage,
  deleteGarment as deleteGarmentRequest,
  deleteWardrobeImage,
  listGarments,
  requestGarmentCutout,
  updateGarment as updateGarmentRequest,
  uploadWardrobeImage,
  WardrobeApiError,
} from "@/lib/wardrobe-api";
import type {
  AttributeKey,
  Category,
  WardrobeContextValue,
  WardrobeItem,
  WardrobeItemPatch,
  WardrobeStyle,
  UploadProgress,
} from "./wardrobe.types";

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof WardrobeApiError && error.message
    ? error.message
    : fallback;

type WardrobeProviderProps = {
  children: ReactNode;
  initialItems: WardrobeItem[];
};

export const WardrobeProvider = ({
  children,
  initialItems,
}: WardrobeProviderProps) => {
  const { messages } = useI18n();
  const noticeMessages = messages.notices;
  const [items, setItems] = useState<WardrobeItem[]>(initialItems);
  const [category, setCategory] = useState<"Tout" | Category>("Tout");
  const [selectedId, setSelectedId] = useState("");
  const [wantedStyle, setWantedStyle] = useState<WardrobeStyle>("Décontracté");
  const [outfit, setOutfit] = useState<WardrobeItem[]>([]);
  const [notice, setNotice] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const mutationQueues = useRef(new Map<string, Promise<void>>());
  const observedCutoutStates = useRef(new Map<string, string>());

  const refreshItems = useCallback(async () => {
    try {
      const currentItems = await listGarments();
      const pendingItems = currentItems.filter(
        (item) => item.cutout?.status === "pending",
      );
      const results = await Promise.allSettled(
        pendingItems.map((item) => requestGarmentCutout(item.id)),
      );
      const processedItems = new Map(
        results.flatMap((result) =>
          result.status === "fulfilled" ? [[result.value.id, result.value]] : [],
        ),
      );

      setItems(
        currentItems.map((item) => processedItems.get(item.id) ?? item),
      );
    } catch (error) {
      setNotice(getErrorMessage(error, noticeMessages.wardrobeLoadError));
    }
  }, [noticeMessages.wardrobeLoadError]);

  const enqueueMutation = useCallback(
    (id: string, mutation: () => Promise<void>) => {
      const previous = mutationQueues.current.get(id) ?? Promise.resolve();
      const next = previous.catch(() => undefined).then(mutation);
      mutationQueues.current.set(id, next);

      void next.then(
        () => {
          if (mutationQueues.current.get(id) === next) {
            mutationQueues.current.delete(id);
          }
        },
        () => {
          if (mutationQueues.current.get(id) === next) {
            mutationQueues.current.delete(id);
          }
        },
      );

      return next;
    },
    [],
  );

  const visibleItems = useMemo(
    () =>
      category === "Tout"
        ? items
        : items.filter((item) => item.category === category),
    [items, category],
  );

  const selected =
    items.find((item) => item.id === selectedId) ?? items[0];

  useEffect(() => {
    for (const item of items) {
      if (!item.cutout) continue;

      const state = `${item.cutout.status}:${item.cutout.failureReason ?? ""}:${item.cutout.failureCode ?? ""}:${item.cutout.failureDetail ?? ""}`;
      if (observedCutoutStates.current.get(item.id) === state) continue;

      observedCutoutStates.current.set(item.id, state);
      console.info("[Wearsona] Background-removal status", {
        garmentId: item.id,
        status: item.cutout.status,
        failureReason: item.cutout.failureReason,
        failureCode: item.cutout.failureCode,
        failureDetail: item.cutout.failureDetail,
      });
    }
  }, [items]);

  useEffect(() => {
    if (!items.some((item) => item.cutout?.status === "pending")) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      void refreshItems();
    }, 8_000);

    return () => window.clearInterval(interval);
  }, [items, refreshItems]);

  const importPhotos = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      const files = Array.from(input.files ?? []);
      input.value = "";

      if (!files.length || isUploading) return;

      setIsUploading(true);
      setNotice(noticeMessages.uploading);

      try {
        const additions: WardrobeItem[] = [];
        const failures: unknown[] = [];

        for (const [index, file] of files.entries()) {
          const current = index + 1;

          try {
            setUploadProgress({ current, total: files.length, step: "analyzing" });
            let analysis;

            try {
              analysis = await analyzeWardrobeImage(file);
            } catch {
              // L'import reste disponible si le service d'analyse est indisponible.
            }

            setUploadProgress({ current, total: files.length, step: "uploading" });
            const uploadedImage = await uploadWardrobeImage(file);

            try {
              setUploadProgress({ current, total: files.length, step: "saving" });
              const garment = await createGarmentRequest({
                name: file.name
                  .replace(/\.[^.]+$/, "")
                  .replaceAll(/[-_]/g, " "),
                category: analysis?.category ?? guessCategory(file.name),
                colors: analysis?.colors.length ? analysis.colors : ["Noir"],
                seasons: analysis?.seasons ?? ["Toute saison"],
                styles: analysis?.styles ?? ["Décontracté"],
                patterns: analysis?.patterns ?? ["Uni"],
                analysis: analysis?.analysis,
                imageKey: uploadedImage.key,
              });

              setUploadProgress({ current, total: files.length, step: "cutout" });
              additions.push(await requestGarmentCutout(garment.id));
            } catch (error) {
              await deleteWardrobeImage(uploadedImage.key).catch(() => undefined);
              throw error;
            }
          } catch (error) {
            failures.push(error);
          }
        }

        if (additions.length) {
          setItems((current) => [...additions, ...current]);
          setSelectedId(additions[0].id);
        }

        if (failures.length && additions.length) {
          setNotice(
            formatMessage(noticeMessages.itemsUploadPartial, {
              success: additions.length,
              failed: failures.length,
            }),
          );
        } else if (failures.length) {
          setNotice(
            getErrorMessage(
              failures[0],
              noticeMessages.itemsUploadFailed,
            ),
          );
        } else {
          setNotice(
            formatMessage(
              additions.length === 1
                ? noticeMessages.itemAdded
                : noticeMessages.itemsAdded,
              { count: additions.length },
            ),
          );
        }
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
      }
    },
    [
      isUploading,
      noticeMessages.itemAdded,
      noticeMessages.itemsAdded,
      noticeMessages.itemsUploadFailed,
      noticeMessages.itemsUploadPartial,
      noticeMessages.uploading,
    ],
  );

  const updateItem = useCallback(
    (id: string, patch: WardrobeItemPatch) => {
      setItems((current) =>
        current.map((item) => {
          if (item.id !== id) return item;

          const changedSuggestionFields = [
            "category",
            "colors",
            "seasons",
            "styles",
            "patterns",
          ].filter((field) => field in patch);
          const analysis = item.analysis
            ? {
                ...item.analysis,
                attributes: Object.fromEntries(
                  Object.entries(item.analysis.attributes).filter(
                    ([field]) => !changedSuggestionFields.includes(field),
                  ),
                ),
              }
            : undefined;

          return { ...item, ...patch, analysis };
        }),
      );
      setOutfit([]);

      void enqueueMutation(id, async () => {
        await updateGarmentRequest(id, patch);
      }).catch(async (error) => {
        setNotice(getErrorMessage(error, noticeMessages.itemUpdateFailed));
        await refreshItems();
      });
    },
    [enqueueMutation, noticeMessages.itemUpdateFailed, refreshItems],
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((current) => current.filter((item) => item.id !== id));
      setOutfit((current) => current.filter((item) => item.id !== id));

      void enqueueMutation(id, async () => {
        await deleteGarmentRequest(id);
      }).catch(async (error) => {
        setNotice(getErrorMessage(error, noticeMessages.itemDeleteFailed));
        await refreshItems();
      });
    },
    [enqueueMutation, noticeMessages.itemDeleteFailed, refreshItems],
  );

  const acceptCutout = useCallback(
    (id: string) => {
      void enqueueMutation(id, async () => {
        const garment = await acceptGarmentCutoutRequest(id);
        setItems((current) =>
          current.map((item) => (item.id === id ? garment : item)),
        );
      }).catch(async (error) => {
        setNotice(getErrorMessage(error, noticeMessages.itemUpdateFailed));
        await refreshItems();
      });
    },
    [enqueueMutation, noticeMessages.itemUpdateFailed, refreshItems],
  );

  const requestCutout = useCallback(
    (id: string) => {
      void enqueueMutation(id, async () => {
        const garment = await requestGarmentCutout(id);
        setItems((current) =>
          current.map((item) => (item.id === id ? garment : item)),
        );
      }).catch(async (error) => {
        setNotice(getErrorMessage(error, noticeMessages.itemUpdateFailed));
        await refreshItems();
      });
    },
    [enqueueMutation, noticeMessages.itemUpdateFailed, refreshItems],
  );

  const toggleAttribute = useCallback(
    <K extends AttributeKey,>(
      id: string,
      key: K,
      value: WardrobeItem[K][number],
    ) => {
      const item = items.find((candidate) => candidate.id === id);
      if (!item) return;

      const current = item[key] as WardrobeItem[K][number][];
      let next: WardrobeItem[K][number][];

      if (key === "seasons" && value === "Toute saison") {
        next = ["Toute saison"] as WardrobeItem[K][number][];
      } else if (current.includes(value)) {
        if (current.length === 1) return;
        next = current.filter((candidate) => candidate !== value);
      } else {
        next = [
          ...current.filter(
            (candidate) =>
              key !== "seasons" || candidate !== "Toute saison",
          ),
          value,
        ];
      }

      updateItem(id, { [key]: next } as WardrobeItemPatch);
    },
    [items, updateItem],
  );

  const createOutfit = useCallback(
    (anchorId?: string) => {
      const anchor =
        items.find((item) => item.id === anchorId) ?? selected;
      if (!anchor) return;
      setOutfit(buildOutfit(anchor, items, wantedStyle));
    },
    [items, selected, wantedStyle],
  );

  const value = useMemo<WardrobeContextValue>(
    () => ({
      items,
      visibleItems,
      category,
      setCategory,
      selectedId,
      setSelectedId,
      selected,
      wantedStyle,
      setWantedStyle,
      outfit,
      notice,
      setNotice,
      isUploading,
      uploadProgress,
      importPhotos,
      updateItem,
      removeItem,
      acceptCutout,
      requestCutout,
      toggleAttribute,
      createOutfit,
    }),
    [
      category,
      acceptCutout,
      createOutfit,
      importPhotos,
      isUploading,
      items,
      notice,
      outfit,
      removeItem,
      requestCutout,
      selected,
      selectedId,
      toggleAttribute,
      updateItem,
      uploadProgress,
      visibleItems,
      wantedStyle,
    ],
  );

  return (
    <WardrobeContext.Provider value={value}>
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => {
  const context = useContext(WardrobeContext);

  if (!context) {
    throw new Error("useWardrobe doit être utilisé dans WardrobeProvider.");
  }

  return context;
};
