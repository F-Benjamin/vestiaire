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
  imageUrl,
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
  imageUrl,
  createdAt: createdAt.toISOString(),
  updatedAt: updatedAt.toISOString(),
});
