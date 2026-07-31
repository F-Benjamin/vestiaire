import "server-only";
import { z } from "zod";
import {
  categories,
  colors,
  patterns,
  seasons,
  wardrobeStyles,
} from "@/components/wardrobe/wardrobe.constants";
import { analyzeFilename } from "@/lib/analyze-filename";

const openAiResponseSchema = z.object({
  output_text: z.string().min(1),
  model: z.string().min(1),
});

const visionResultSchema = z.object({
  category: z.enum(categories),
  categoryConfidence: z.number().min(0).max(1),
  colors: z.array(z.enum(colors)).min(1).max(3),
  colorsConfidence: z.number().min(0).max(1),
  seasons: z.array(z.enum(seasons)).min(1).max(seasons.length),
  seasonsConfidence: z.number().min(0).max(1),
  styles: z.array(z.enum(wardrobeStyles)).min(1).max(wardrobeStyles.length),
  stylesConfidence: z.number().min(0).max(1),
  patterns: z.array(z.enum(patterns)).min(1).max(patterns.length),
  patternsConfidence: z.number().min(0).max(1),
});

export type GarmentSuggestion = {
  category: z.infer<typeof visionResultSchema>["category"];
  colors: z.infer<typeof visionResultSchema>["colors"];
  seasons: z.infer<typeof visionResultSchema>["seasons"];
  styles: z.infer<typeof visionResultSchema>["styles"];
  patterns: z.infer<typeof visionResultSchema>["patterns"];
  analysis: {
    source: "openai" | "filename";
    model: string | null;
    analyzedAt: Date;
    attributes: {
      category?: { value: z.infer<typeof visionResultSchema>["category"]; confidence: number };
      colors?: { values: z.infer<typeof visionResultSchema>["colors"]; confidence: number };
      seasons?: { values: z.infer<typeof visionResultSchema>["seasons"]; confidence: number };
      styles?: { values: z.infer<typeof visionResultSchema>["styles"]; confidence: number };
      patterns?: { values: z.infer<typeof visionResultSchema>["patterns"]; confidence: number };
    };
  };
};

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "category",
    "categoryConfidence",
    "colors",
    "colorsConfidence",
    "seasons",
    "seasonsConfidence",
    "styles",
    "stylesConfidence",
    "patterns",
    "patternsConfidence",
  ],
  properties: {
    category: { type: "string", enum: categories },
    categoryConfidence: { type: "number", minimum: 0, maximum: 1 },
    colors: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: { type: "string", enum: colors },
    },
    colorsConfidence: { type: "number", minimum: 0, maximum: 1 },
    seasons: {
      type: "array",
      minItems: 1,
      maxItems: seasons.length,
      items: { type: "string", enum: seasons },
    },
    seasonsConfidence: { type: "number", minimum: 0, maximum: 1 },
    styles: {
      type: "array",
      minItems: 1,
      maxItems: wardrobeStyles.length,
      items: { type: "string", enum: wardrobeStyles },
    },
    stylesConfidence: { type: "number", minimum: 0, maximum: 1 },
    patterns: {
      type: "array",
      minItems: 1,
      maxItems: patterns.length,
      items: { type: "string", enum: patterns },
    },
    patternsConfidence: { type: "number", minimum: 0, maximum: 1 },
  },
} as const;

const analysisPrompt = `Analyse une seule pièce de garde-robe visible sur l'image.
Retourne seulement les valeurs du schéma fourni. Les valeurs possibles sont en français.
N'invente pas de marque, de matière, de genre, de personne ou de contexte non visible.
Choisis plusieurs couleurs seulement si elles sont clairement présentes. La confiance est un nombre entre 0 et 1.
Pour les saisons, choisis « Toute saison » si la pièce convient vraiment à toute l'année ; sinon choisis les saisons compatibles.
Pour les motifs, « Uni » est approprié lorsque la pièce n'a pas de motif reconnaissable.`;

const toDataUrl = async (image: File) => {
  const bytes = Buffer.from(await image.arrayBuffer());
  return `data:${image.type};base64,${bytes.toString("base64")}`;
};

const fallbackFromFilename = (filename: string): GarmentSuggestion => {
  const result = analyzeFilename(filename);
  const analyzedAt = new Date();

  return {
    category: result.category,
    colors: result.colors,
    seasons: ["Toute saison"],
    styles: ["Décontracté"],
    patterns: ["Uni"],
    analysis: {
      source: "filename",
      model: null,
      analyzedAt,
      attributes: {
        category: { value: result.category, confidence: 0.45 },
        colors: { values: result.colors, confidence: 0.45 },
      },
    },
  };
};

const isOpenAiConfigured = () => Boolean(process.env.OPENAI_API_KEY?.trim());

export const analyzeGarmentImage = async (
  filename: string,
  image?: File,
): Promise<GarmentSuggestion> => {
  if (!image || !isOpenAiConfigured()) {
    return fallbackFromFilename(filename);
  }

  const model = process.env.OPENAI_VISION_MODEL?.trim() || "gpt-5.6";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      max_output_tokens: 350,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: analysisPrompt },
            {
              type: "input_image",
              image_url: await toDataUrl(image),
              detail: "low",
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "garment_analysis",
          strict: true,
          schema: analysisSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI vision request failed with status ${response.status}.`);
  }

  const payload = openAiResponseSchema.parse(await response.json());
  const result = visionResultSchema.parse(JSON.parse(payload.output_text));
  const analyzedAt = new Date();

  return {
    category: result.category,
    colors: result.colors,
    seasons: result.seasons,
    styles: result.styles,
    patterns: result.patterns,
    analysis: {
      source: "openai",
      model: payload.model,
      analyzedAt,
      attributes: {
        category: {
          value: result.category,
          confidence: result.categoryConfidence,
        },
        colors: { values: result.colors, confidence: result.colorsConfidence },
        seasons: { values: result.seasons, confidence: result.seasonsConfidence },
        styles: { values: result.styles, confidence: result.stylesConfidence },
        patterns: { values: result.patterns, confidence: result.patternsConfidence },
      },
    },
  };
};
