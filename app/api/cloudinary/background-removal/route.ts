import { z } from "zod";
import {
  deleteCloudinaryAsset,
  downloadBackgroundRemovedImage,
  verifyCloudinaryNotification,
} from "@/lib/cloudinary/background-removal";
import { logCloudinaryCutoutFailure } from "@/lib/cloudinary/diagnostics";
import {
  completeGarmentCutout,
  failGarmentCutout,
  getGarmentByCutoutAssetId,
} from "@/lib/repositories/garment-repository";
import { storeDerivedWardrobeImage } from "@/lib/storage/wardrobe-image-store";

const notificationSchema = z
  .object({
    asset_id: z.string().min(1),
    info_data: z
      .object({ confidence_score: z.number().min(0).max(1).optional() })
      .optional(),
    info_status: z.string().optional(),
    public_id: z.string().min(1),
  })
  .passthrough();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = async (request: Request) => {
  const body = await request.text();
  const signature = request.headers.get("x-cld-signature");
  const timestamp = request.headers.get("x-cld-timestamp");

  if (!verifyCloudinaryNotification(body, signature, timestamp)) {
    return new Response(null, { status: 401 });
  }

  try {
    const notification = notificationSchema.parse(JSON.parse(body));
    const garment = await getGarmentByCutoutAssetId(notification.asset_id);

    if (!garment || garment.cutout?.status !== "pending") {
      return new Response(null, { status: 200 });
    }

    if (notification.info_status !== "complete") {
      await failGarmentCutout(garment._id.toHexString(), "provider_failed");
      await deleteCloudinaryAsset(notification.public_id);
      return new Response(null, { status: 200 });
    }

    try {
      const image = await downloadBackgroundRemovedImage(notification.public_id);
      const stored = await storeDerivedWardrobeImage(garment.ownerId, image);
      await completeGarmentCutout(
        garment._id.toHexString(),
        stored.key,
        notification.info_data?.confidence_score,
      );
      await deleteCloudinaryAsset(notification.public_id);
    } catch (error) {
      await failGarmentCutout(garment._id.toHexString(), "download_failed");
      logCloudinaryCutoutFailure({
        error,
        garmentId: garment._id.toHexString(),
        stage: "download",
      });
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    logCloudinaryCutoutFailure({ error, garmentId: "unknown", stage: "webhook" });
    return new Response(null, { status: 400 });
  }
};
