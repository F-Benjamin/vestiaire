import "server-only";

export const categories = [
  "Hauts",
  "Bas",
  "Robes",
  "Vestes",
  "Chaussures",
  "Accessoires",
] as const;

export type Category = (typeof categories)[number];

const categoryHints: Record<Category, string[]> = {
  Hauts: ["top", "shirt", "chemise", "pull", "sweat", "tshirt", "t-shirt", "blouse"],
  Bas: ["jean", "pantalon", "jupe", "short", "trouser", "skirt"],
  Robes: ["robe", "dress"],
  Vestes: ["veste", "jacket", "blazer", "manteau", "coat", "parka"],
  Chaussures: ["shoe", "chaussure", "basket", "sneaker", "boot", "botte", "mocassin"],
  Accessoires: ["sac", "bag", "ceinture", "belt", "foulard", "bijou", "chapeau", "hat"],
};

const colorHints: Record<string, string[]> = {
  Noir: ["noir", "noire", "black", "anthracite"],
  Blanc: ["blanc", "blanche", "white", "ivoire", "ivory"],
  Gris: ["gris", "grise", "grey", "gray", "argent", "silver"],
  Beige: ["beige", "écru", "ecru", "cream", "crème", "creme", "sable", "nude"],
  Marron: ["marron", "brun", "brown", "camel", "chocolat"],
  Bleu: ["bleu", "bleue", "blue", "marine", "navy", "denim"],
  Vert: ["vert", "verte", "green", "kaki", "khaki", "olive"],
  Rouge: ["rouge", "red", "bordeaux", "burgundy", "grenat"],
  Rose: ["rose", "pink", "fuchsia", "saumon"],
  Jaune: ["jaune", "yellow", "moutarde", "mustard"],
  Orange: ["orange", "corail", "coral", "rouille"],
  Violet: ["violet", "violette", "purple", "lilas", "lavande"],
};

const words = (filename: string) =>
  filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

export const analyzeFilename = (filename: string) => {
  const tokens = words(filename);
  const includes = (hint: string) =>
    tokens.includes(
      hint.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
    );

  const category =
    categories.find((candidate) =>
      categoryHints[candidate].some(includes),
    ) ?? "Hauts";

  const colors = Object.entries(colorHints)
    .filter(([, hints]) => hints.some(includes))
    .map(([color]) => color);

  return { category, colors };
};
