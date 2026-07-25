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
  imageKey: imageKey ?? null,
  imageUrl: imageKey ? `/api/wardrobe-images/${imageKey}` : null,
  createdAt: createdAt.toISOString(),
  updatedAt: updatedAt.toISOString(),
});
