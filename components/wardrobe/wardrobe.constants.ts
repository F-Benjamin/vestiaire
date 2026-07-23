import type {
  Category,
  Pattern,
  Season,
  WardrobeStyle,
} from "./wardrobe.types";

export const categories: Category[] = [
  "Hauts",
  "Bas",
  "Robes",
  "Vestes",
  "Chaussures",
  "Accessoires",
];

export const seasons: Season[] = [
  "Toute saison",
  "Printemps",
  "Été",
  "Automne",
  "Hiver",
];

export const wardrobeStyles: WardrobeStyle[] = [
  "Décontracté",
  "Chic",
  "Créatif",
  "Minimal",
  "Travail",
];

export const patterns: Pattern[] = [
  "Uni",
  "Rayures",
  "Carreaux",
  "Fleurs",
  "Pois",
  "Graphique",
  "Animal",
  "Texturé",
];

export const colors = [
  "Noir",
  "Blanc",
  "Gris",
  "Beige",
  "Marron",
  "Bleu",
  "Vert",
  "Rouge",
  "Rose",
  "Jaune",
  "Orange",
  "Violet",
];

export const neutralColors = ["Noir", "Blanc", "Gris", "Beige", "Marron"];

export const categoryHints: Record<Category, string[]> = {
  Hauts: ["top", "shirt", "chemise", "pull", "sweat", "tshirt", "blouse"],
  Bas: ["jean", "pantalon", "jupe", "short", "trouser", "skirt"],
  Robes: ["robe", "dress"],
  Vestes: ["veste", "jacket", "blazer", "manteau", "coat", "parka"],
  Chaussures: ["shoe", "chaussure", "basket", "sneaker", "boot", "botte"],
  Accessoires: ["sac", "bag", "ceinture", "belt", "foulard", "bijou", "chapeau"],
};
