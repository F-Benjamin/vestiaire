import { z } from "zod";
import {
  categories,
  patterns,
  seasons,
  wardrobeStyles,
} from "@/components/wardrobe/wardrobe.constants";

export const garmentInputSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    category: z.enum(categories),
    colors: z.array(z.string().trim().min(1).max(40)).min(1).max(8),
    seasons: z.array(z.enum(seasons)).min(1).max(seasons.length),
    styles: z
      .array(z.enum(wardrobeStyles))
      .min(1)
      .max(wardrobeStyles.length),
    patterns: z.array(z.enum(patterns)).min(1).max(patterns.length),
    imageUrl: z.url().nullable().default(null),
  })
  .strict();

export type GarmentInput = z.infer<typeof garmentInputSchema>;

export type GarmentDocument = GarmentInput & {
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};
