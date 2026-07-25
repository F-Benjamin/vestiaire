export const categories = [
  "Hauts",
  "Bas",
  "Robes",
  "Vestes",
  "Chaussures",
  "Accessoires",
] as const;

export const seasons = [
  "Toute saison",
  "Printemps",
  "Été",
  "Automne",
  "Hiver",
] as const;

export const wardrobeStyles = [
  "Décontracté",
  "Chic",
  "Créatif",
  "Minimal",
  "Travail",
] as const;

export const patterns = [
  "Uni",
  "Rayures",
  "Carreaux",
  "Fleurs",
  "Pois",
  "Graphique",
  "Animal",
  "Texturé",
] as const;

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

export const categoryHints: Record<(typeof categories)[number], string[]> = {
  Hauts: ["top", "shirt", "chemise", "pull", "sweat", "tshirt", "blouse"],
  Bas: ["jean", "pantalon", "jupe", "short", "trouser", "skirt"],
  Robes: ["robe", "dress"],
  Vestes: ["veste", "jacket", "blazer", "manteau", "coat", "parka"],
  Chaussures: ["shoe", "chaussure", "basket", "sneaker", "boot", "botte"],
  Accessoires: ["sac", "bag", "ceinture", "belt", "foulard", "bijou", "chapeau"],
};
