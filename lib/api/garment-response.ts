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
  originalImageKey,
  cutout,
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
  originalImageKey: originalImageKey ?? null,
  originalImageUrl: originalImageKey
    ? `/api/wardrobe-images/${originalImageKey}`
    : null,
  cutout: cutout
    ? {
        ...cutout,
        createdAt: cutout.createdAt.toISOString(),
        completedAt: cutout.completedAt?.toISOString(),
        acceptedAt: cutout.acceptedAt?.toISOString(),
        originalDeleteAfter: cutout.originalDeleteAfter?.toISOString(),
        originalDeletedAt: cutout.originalDeletedAt?.toISOString(),
      }
    : undefined,
  cutoutImageUrl: cutout?.imageKey
    ? `/api/wardrobe-images/${cutout.imageKey}`
    : null,
  createdAt: createdAt.toISOString(),
  updatedAt: updatedAt.toISOString(),
});
