import { NextResponse } from "next/server";
import { toGarmentResponse } from "@/lib/api/garment-response";
import { getAuthenticatedUser } from "@/lib/api/authenticated-user";
import {
  garmentNotFound,
  internalError,
  unauthorized,
} from "@/lib/api/json-response";
import { ensureSameOrigin } from "@/lib/api/mutation-request";
import {
  deleteCloudinaryAsset,
  CloudinaryCutoutDeliveryError,
  downloadBackgroundRemovedImage,
  isCloudinaryConfigured,
  uploadOriginalForBackgroundRemoval,
} from "@/lib/cloudinary/background-removal";
import { logCloudinaryCutoutFailure } from "@/lib/cloudinary/diagnostics";
import {
  getGarment,
  completeGarmentCutout,
  failGarmentCutout,
  failGarmentCutoutRequest,
  markGarmentCutoutUnavailable,
  queueGarmentCutout,
} from "@/lib/repositories/garment-repository";
import {
  getOwnedWardrobeImage,
  storeDerivedWardrobeImage,
} from "@/lib/storage/wardrobe-image-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CutoutRouteContext = {
  params: Promise<{ id: string }>;
};

const processPendingCutout = async (
  garment: NonNullable<Awaited<ReturnType<typeof getGarment>>>,
) => {
  if (!garment.cutout?.providerPublicId) return garment;

  try {
    const result = await downloadBackgroundRemovedImage(garment.cutout.providerPublicId);
    if (result.status === "pending") return garment;

    const stored = await storeDerivedWardrobeImage(garment.ownerId, result.image);
    const completed = await completeGarmentCutout(
      garment._id.toHexString(),
      stored.key,
      undefined,
    );
    await deleteCloudinaryAsset(garment.cutout.providerPublicId);

    return completed ?? garment;
  } catch (error) {
    const failed = await failGarmentCutout(
      garment._id.toHexString(),
      "download_failed",
      error instanceof CloudinaryCutoutDeliveryError
        ? `HTTP_${error.httpCode}`
        : undefined,
    );
    logCloudinaryCutoutFailure({
      error,
      garmentId: garment._id.toHexString(),
      stage: "download",
    });
    return failed ?? garment;
  }
};

export const POST = async (
  request: Request,
  { params }: CutoutRouteContext,
) => {
  const forbidden = await ensureSameOrigin(request);
  if (forbidden) return forbidden;

  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorized(request);

    const { id } = await params;
    const garment = await getGarment(user.id, id);
    if (!garment) return garmentNotFound(request);

    if (garment.cutout?.status === "pending") {
      const processed = await processPendingCutout(garment);
      return NextResponse.json({ data: toGarmentResponse(processed) });
    }

    if (garment.cutout?.status === "ready" || garment.cutout?.status === "accepted") {
      return NextResponse.json({ data: toGarmentResponse(garment) });
    }

    if (!garment.originalImageKey) {
      return NextResponse.json({ data: toGarmentResponse(garment) });
    }

    if (!isCloudinaryConfigured()) {
      const unavailable = await markGarmentCutoutUnavailable(user.id, id);
      return NextResponse.json({
        data: toGarmentResponse(unavailable ?? garment),
      });
    }

    try {
      const original = await getOwnedWardrobeImage(user.id, garment.originalImageKey);
      const job = await uploadOriginalForBackgroundRemoval({
        garmentId: id,
        contentType: original.metadata.contentType,
        image: original.data as ArrayBuffer,
        ownerId: user.id,
      });
      const queued = await queueGarmentCutout(user.id, id, {
        createdAt: new Date(),
        providerAssetId: job.assetId,
        providerPublicId: job.publicId,
      });

      return NextResponse.json({ data: toGarmentResponse(queued ?? garment) });
    } catch (error) {
      const failed = await failGarmentCutoutRequest(user.id, id, "request_failed");
      logCloudinaryCutoutFailure({ error, garmentId: id, stage: "request" });
      return NextResponse.json({ data: toGarmentResponse(failed ?? garment) });
    }
  } catch (error) {
    return internalError(request, error);
  }
};
