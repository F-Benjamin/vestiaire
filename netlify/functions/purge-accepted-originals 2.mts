import type { Config } from "@netlify/functions";
import {
  listExpiredOriginals,
  markOriginalDeleted,
} from "../../lib/repositories/garment-repository";
import {
  deleteOwnedWardrobeImage,
  WardrobeImageError,
} from "../../lib/storage/wardrobe-image-store";

const purgeAcceptedOriginals = async () => {
  const garments = await listExpiredOriginals(new Date());
  let deleted = 0;

  for (const garment of garments) {
    if (!garment.originalImageKey) continue;

    try {
      await deleteOwnedWardrobeImage(garment.ownerId, garment.originalImageKey);
      await markOriginalDeleted(garment._id.toHexString());
      deleted += 1;
    } catch (error) {
      if (error instanceof WardrobeImageError && error.reason === "not_found") {
        await markOriginalDeleted(garment._id.toHexString());
        deleted += 1;
        continue;
      }

      console.error(
        `Original image purge failed: ${
          error instanceof Error ? error.name : "UnknownError"
        }`,
      );
    }
  }

  console.info(`Wearsona original image purge completed: ${deleted} deleted.`);
};

export default purgeAcceptedOriginals;

export const config: Config = {
  schedule: "@daily",
};
