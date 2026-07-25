import { getAuthenticatedUser } from "@/lib/api/authenticated-user";
import { toGarmentResponse } from "@/lib/api/garment-response";
import {
  garmentNotFound,
  internalError,
  invalidRequest,
  unauthorized,
} from "@/lib/api/json-response";
import {
  deleteGarment,
  updateGarment,
} from "@/lib/repositories/garment-repository";
import { garmentUpdateSchema } from "@/lib/schemas/garment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GarmentRouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = async (
  request: Request,
  { params }: GarmentRouteContext,
) => {
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
    const garment = await updateGarment(user.id, id, input);

    if (!garment) {
      return garmentNotFound(request);
    }

    return Response.json({ data: toGarmentResponse(garment) });
  } catch (error) {
    return internalError(request, error);
  }
};

export const DELETE = async (
  request: Request,
  { params }: GarmentRouteContext,
) => {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorized(request);
    }

    const { id } = await params;
    const deleted = await deleteGarment(user.id, id);

    if (!deleted) {
      return garmentNotFound(request);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return internalError(request, error);
  }
};
