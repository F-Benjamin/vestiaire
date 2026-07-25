import { z } from "zod";
import {
  categories,
  patterns,
  seasons,
  wardrobeStyles,
} from "@/components/wardrobe/wardrobe.constants";

const uniqueValues = <T>(values: T[]) => new Set(values).size === values.length;

export const wardrobeImageKeySchema = z
  .string()
  .regex(
    /^[a-f0-9]{64}\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp)$/,
    "Invalid wardrobe image key.",
  );

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
  imageKey: wardrobeImageKeySchema.nullable(),
});

export const garmentInputSchema = garmentFieldsSchema
  .extend({
    imageKey: wardrobeImageKeySchema.nullable().default(null),
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
