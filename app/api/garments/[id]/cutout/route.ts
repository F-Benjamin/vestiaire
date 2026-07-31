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
  isCloudinaryConfigured,
  requestBackgroundRemoval,
} from "@/lib/cloudinary/background-removal";
import {
  getGarment,
  queueGarmentCutout,
} from "@/lib/repositories/garment-repository";
import { getOwnedWardrobeImage } from "@/lib/storage/wardrobe-image-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CutoutRouteContext = {
  params: Promise<{ id: string }>;
};

const getRequestOrigin = (request: Request) => {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto");

  if (forwardedHost && forwardedProtocol) {
    return `${forwardedProtocol}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
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

    if (garment.cutout?.status === "pending" || garment.cutout?.status === "ready" || garment.cutout?.status === "accepted") {
      return NextResponse.json({ data: toGarmentResponse(garment) });
    }

    if (!garment.originalImageKey || !isCloudinaryConfigured()) {
      return NextResponse.json({ data: toGarmentResponse(garment) });
    }

    const original = await getOwnedWardrobeImage(user.id, garment.originalImageKey);
    const notificationUrl = `${getRequestOrigin(request)}/api/cloudinary/background-removal`;
    const job = await requestBackgroundRemoval({
      garmentId: id,
      contentType: original.metadata.contentType,
      image: original.data as ArrayBuffer,
      notificationUrl,
      ownerId: user.id,
    });
    const queued = await queueGarmentCutout(user.id, id, {
      createdAt: new Date(),
      providerAssetId: job.assetId,
      providerPublicId: job.publicId,
    });

    return NextResponse.json({
      data: toGarmentResponse(queued ?? garment),
    });
  } catch (error) {
    return internalError(request, error);
  }
};
