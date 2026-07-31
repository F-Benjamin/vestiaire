import "server-only";
import type { WithId } from "mongodb";
import type { GarmentDocument } from "@/lib/schemas/garment";

export const toGarmentResponse = ({
  _id,
  name,
  category,
  colors,
  seasons,
  styles,
  patterns,
  analysis,
  imageKey,
  createdAt,
  updatedAt,
}: WithId<GarmentDocument>) => ({
  id: _id.toHexString(),
  name,
  category,
  colors,
  seasons,
  styles,
  patterns,
  analysis: analysis
    ? {
        ...analysis,
        analyzedAt: analysis.analyzedAt.toISOString(),
      }
    : undefined,
  imageKey: imageKey ?? null,
  imageUrl: imageKey ? `/api/wardrobe-images/${imageKey}` : null,
  createdAt: createdAt.toISOString(),
  updatedAt: updatedAt.toISOString(),
});
