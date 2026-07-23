import {
  categories,
  categoryHints,
  neutralColors,
} from "@/components/wardrobe/wardrobe.constants";
import type {
  Category,
  LegacyWardrobeItem,
  WardrobeItem,
  WardrobeStyle,
} from "@/components/wardrobe/wardrobe.types";

export const guessCategory = (filename: string): Category => {
  const value = filename.toLowerCase();
  return (
    categories.find((category) =>
      categoryHints[category].some((hint) => value.includes(hint)),
    ) ?? "Hauts"
  );
};

export const normalizeItem = (item: LegacyWardrobeItem): WardrobeItem => ({
  ...item,
  colors: item.colors ?? [item.color ?? "Noir"],
  seasons: item.seasons ?? [item.season ?? "Toute saison"],
  styles: item.styles ?? [item.style ?? "Décontracté"],
  patterns: item.patterns ?? ["Uni"],
});

export const scoreOutfitItem = (
  anchor: WardrobeItem,
  candidate: WardrobeItem,
  wantedStyle: WardrobeStyle,
) => {
  let score = candidate.styles.includes(wantedStyle) ? 5 : 0;

  if (candidate.styles.some((style) => anchor.styles.includes(style))) score += 2;
  if (
    candidate.seasons.includes("Toute saison") ||
    anchor.seasons.includes("Toute saison") ||
    candidate.seasons.some((season) => anchor.seasons.includes(season))
  ) score += 3;
  if (
    anchor.colors.some((color) => neutralColors.includes(color)) ||
    candidate.colors.some((color) => neutralColors.includes(color))
  ) score += 4;
  if (candidate.colors.some((color) => anchor.colors.includes(color))) score += 1;

  return score;
};

export const buildOutfit = (
  anchor: WardrobeItem,
  items: WardrobeItem[],
  wantedStyle: WardrobeStyle,
) => {
  const wantedCategories: Category[] =
    anchor.category === "Robes"
      ? ["Robes", "Vestes", "Chaussures", "Accessoires"]
      : ["Hauts", "Bas", "Vestes", "Chaussures", "Accessoires"];

  const result = wantedCategories
    .map((category) => {
      if (anchor.category === category) return anchor;

      return items
        .filter((item) => item.category === category && item.id !== anchor.id)
        .sort(
          (first, second) =>
            scoreOutfitItem(anchor, second, wantedStyle) -
            scoreOutfitItem(anchor, first, wantedStyle),
        )[0];
    })
    .filter(Boolean) as WardrobeItem[];

  return [...new Map(result.map((item) => [item.id, item])).values()];
};
