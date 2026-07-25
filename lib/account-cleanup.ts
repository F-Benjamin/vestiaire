import "server-only";
import { deleteGarmentsByOwner } from "@/lib/repositories/garment-repository";
import { deleteAllOwnedWardrobeImages } from "@/lib/storage/wardrobe-image-store";

export const deleteApplicationData = async (userId: string) => {
  const results = await Promise.allSettled([
    deleteGarmentsByOwner(userId),
    deleteAllOwnedWardrobeImages(userId),
  ]);
  const failures = results.filter((result) => result.status === "rejected");

  if (failures.length) {
    console.error(
      `[account-cleanup] ${failures.length} cleanup operation(s) failed.`,
    );
  }
};
