import { z } from "zod";
import {
  categories,
  patterns,
  seasons,
  wardrobeStyles,
} from "@/components/wardrobe/wardrobe.constants";

const uniqueValues = <T>(values: T[]) => new Set(values).size === values.length;

const imageUrlSchema = z
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "https:" || protocol === "http:";
  }, "Image URL must use HTTP or HTTPS.");

const garmentFieldsSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.enum(categories),
  colors: z
    .array(z.string().trim().min(1).max(40))
    .min(1)
    .max(8)
    .refine(uniqueValues, "Colors must be unique."),
  seasons: z
    .array(z.enum(seasons))
    .min(1)
    .max(seasons.length)
    .refine(uniqueValues, "Seasons must be unique."),
  styles: z
    .array(z.enum(wardrobeStyles))
    .min(1)
    .max(wardrobeStyles.length)
    .refine(uniqueValues, "Styles must be unique."),
  patterns: z
    .array(z.enum(patterns))
    .min(1)
    .max(patterns.length)
    .refine(uniqueValues, "Patterns must be unique."),
  imageUrl: imageUrlSchema.nullable(),
});

export const garmentInputSchema = garmentFieldsSchema
  .extend({
    imageUrl: imageUrlSchema.nullable().default(null),
  })
  .strict();

export const garmentUpdateSchema = garmentFieldsSchema
  .partial()
  .strict()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one field must be provided.",
  });

export type GarmentInput = z.infer<typeof garmentInputSchema>;
export type GarmentUpdate = z.infer<typeof garmentUpdateSchema>;

export type GarmentDocument = GarmentInput & {
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};
