"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useI18n } from "@/components/i18n/LocalizationProvider";
import { formatMessage } from "@/i18n/format";
import { buildOutfit, guessCategory, normalizeItem } from "@/lib/wardrobe";
import type {
  AttributeKey,
  Category,
  LegacyWardrobeItem,
  WardrobeContextValue,
  WardrobeItem,
  WardrobeStyle,
} from "./wardrobe.types";

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

const readFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const WardrobeProvider = ({ children }: { children: ReactNode }) => {
  const { messages } = useI18n();
  const noticeMessages = messages.notices;
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [category, setCategory] = useState<"Tout" | Category>("Tout");
  const [selectedId, setSelectedId] = useState("");
  const [wantedStyle, setWantedStyle] = useState<WardrobeStyle>("Décontracté");
  const [outfit, setOutfit] = useState<WardrobeItem[]>([]);
  const [notice, setNotice] = useState("");
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem("vestiaire-local");
        if (saved) {
          const parsed = JSON.parse(saved) as LegacyWardrobeItem[];
          setItems(parsed.map(normalizeItem));
        }
      } catch {
        setNotice(noticeMessages.storageReadError);
      } finally {
        setStorageReady(true);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [noticeMessages.storageReadError]);

  useEffect(() => {
    if (!storageReady) return;

    try {
      localStorage.setItem("vestiaire-local", JSON.stringify(items));
    } catch {
      if (items.length) {
        const timeout = window.setTimeout(
          () =>
            setNotice(noticeMessages.storageFull),
          0,
        );
        return () => window.clearTimeout(timeout);
      }
    }
  }, [items, noticeMessages.storageFull, storageReady]);

  const visibleItems = useMemo(
    () =>
      category === "Tout"
        ? items
        : items.filter((item) => item.category === category),
    [items, category],
  );

  const selected =
    items.find((item) => item.id === selectedId) ?? items[0];

  const importPhotos = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!files.length) return;

    const additions = await Promise.all(
      files.map(async (file): Promise<WardrobeItem> => {
        let analysis: { category?: Category; colors?: string[] } = {};

        try {
          const response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: file.name }),
          });
          if (response.ok) analysis = await response.json();
        } catch {
          // Le classement local reste disponible si l’API est indisponible.
        }

        return {
          id: crypto.randomUUID(),
          name: file.name.replace(/\.[^.]+$/, "").replaceAll(/[-_]/g, " "),
          category: analysis.category ?? guessCategory(file.name),
          colors: analysis.colors?.length ? analysis.colors : ["Noir"],
          seasons: ["Toute saison"],
          styles: ["Décontracté"],
          patterns: ["Uni"],
          image: await readFile(file),
        };
      }),
    );

    setItems((current) => [...additions, ...current]);
    setSelectedId(additions[0].id);
    setNotice(
      formatMessage(
        additions.length === 1
          ? noticeMessages.itemAdded
          : noticeMessages.itemsAdded,
        { count: additions.length },
      ),
    );
    event.target.value = "";
  }, [noticeMessages.itemAdded, noticeMessages.itemsAdded]);

  const updateItem = useCallback((id: string, patch: Partial<WardrobeItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
    setOutfit([]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setOutfit((current) => current.filter((item) => item.id !== id));
  }, []);

  const toggleAttribute = useCallback(<K extends AttributeKey,>(
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

    updateItem(id, { [key]: next } as Partial<WardrobeItem>);
  }, [items, updateItem]);

  const createOutfit = useCallback((anchorId?: string) => {
    const anchor =
      items.find((item) => item.id === anchorId) ?? selected;
    if (!anchor) return;
    setOutfit(buildOutfit(anchor, items, wantedStyle));
  }, [items, selected, wantedStyle]);

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
