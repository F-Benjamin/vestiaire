import { getAuthenticatedUser } from "@/lib/api/authenticated-user";
import { toGarmentResponse } from "@/lib/api/garment-response";
import {
  garmentNotFound,
  internalError,
  invalidRequest,
  unauthorized,
} from "@/lib/api/json-response";
import { ensureSameOrigin } from "@/lib/api/mutation-request";
import { wardrobeImageErrorResponse } from "@/lib/api/wardrobe-image-response";
import {
  deleteGarment,
  getGarment,
  isGarmentImageReferenced,
  updateGarment,
} from "@/lib/repositories/garment-repository";
import { garmentUpdateSchema } from "@/lib/schemas/garment";
import {
  assertWardrobeImageOwnership,
  deleteOwnedWardrobeImage,
  WardrobeImageError,
} from "@/lib/storage/wardrobe-image-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GarmentRouteContext = {
  params: Promise<{ id: string }>;
};

const deleteImageWithoutBlocking = async (ownerId: string, imageKey: string) => {
  try {
    if (await isGarmentImageReferenced(ownerId, imageKey)) {
      return;
    }

    await deleteOwnedWardrobeImage(ownerId, imageKey);
  } catch (error) {
    if (
      error instanceof WardrobeImageError &&
      error.reason === "not_found"
    ) {
      return;
    }

    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.error(`Garment image cleanup failed: ${errorName}`);
  }
};

export const PATCH = async (
  request: Request,
  { params }: GarmentRouteContext,
) => {
  const forbidden = await ensureSameOrigin(request);

  if (forbidden) {
    return forbidden;
  }

  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorized(request);
    }

    let input;

    try {
      input = garmentUpdateSchema.parse(await request.json());
    } catch (error) {
      return invalidRequest(request, error);
    }

    const { id } = await params;
    const existingGarment = await getGarment(user.id, id);

    if (!existingGarment) {
      return garmentNotFound(request);
    }

    if (input.imageKey) {
      await assertWardrobeImageOwnership(user.id, input.imageKey);
    }

    const garment = await updateGarment(user.id, id, input);

    if (!garment) {
      return garmentNotFound(request);
    }

    if (
      existingGarment.imageKey &&
      "imageKey" in input &&
      existingGarment.imageKey !== input.imageKey
    ) {
      await deleteImageWithoutBlocking(user.id, existingGarment.imageKey);
    }

    return Response.json({ data: toGarmentResponse(garment) });
  } catch (error) {
    if (error instanceof WardrobeImageError) {
      return wardrobeImageErrorResponse(request, error);
    }

    return internalError(request, error);
  }
};

export const DELETE = async (
  request: Request,
  { params }: GarmentRouteContext,
) => {
  const forbidden = await ensureSameOrigin(request);

  if (forbidden) {
    return forbidden;
  }

  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorized(request);
    }

    const { id } = await params;
    const garment = await deleteGarment(user.id, id);

    if (!garment) {
      return garmentNotFound(request);
    }

    if (garment.imageKey) {
      await deleteImageWithoutBlocking(user.id, garment.imageKey);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return internalError(request, error);
  }
};
