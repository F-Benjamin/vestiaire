"use client";

import {
  createContext,
  useCallback,
  useContext,
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
  analyzeWardrobeImage,
  deleteGarment as deleteGarmentRequest,
  deleteWardrobeImage,
  listGarments,
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
  const mutationQueues = useRef(new Map<string, Promise<void>>());

  const refreshItems = useCallback(async () => {
    try {
      setItems(await listGarments());
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

  const importPhotos = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      const files = Array.from(input.files ?? []);
      input.value = "";

      if (!files.length || isUploading) return;

      setIsUploading(true);
      setNotice(noticeMessages.uploading);

      try {
        const results = await Promise.allSettled(
          files.map(async (file): Promise<WardrobeItem> => {
            let analysis;

            try {
              analysis = await analyzeWardrobeImage(file);
            } catch {
              // L'import reste disponible si le service d'analyse est indisponible.
            }

            const uploadedImage = await uploadWardrobeImage(file);

            try {
              return await createGarmentRequest({
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
            } catch (error) {
              await deleteWardrobeImage(uploadedImage.key).catch(() => undefined);
              throw error;
            }
          }),
        );

        const additions = results.flatMap((result) =>
          result.status === "fulfilled" ? [result.value] : [],
        );
        const failures = results.filter(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected",
        );

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
              failures[0].reason,
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
      importPhotos,
      updateItem,
      removeItem,
      toggleAttribute,
      createOutfit,
    }),
    [
      category,
      createOutfit,
      importPhotos,
      isUploading,
      items,
      notice,
      outfit,
      removeItem,
      selected,
      selectedId,
      toggleAttribute,
      updateItem,
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
