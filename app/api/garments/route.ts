import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/authenticated-user";
import { toGarmentResponse } from "@/lib/api/garment-response";
import {
  internalError,
  invalidRequest,
  unauthorized,
} from "@/lib/api/json-response";
import {
  createGarment,
  ensureGarmentIndexes,
  listGarments,
} from "@/lib/repositories/garment-repository";
import { garmentInputSchema } from "@/lib/schemas/garment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async (request: Request) => {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorized(request);
    }

    await ensureGarmentIndexes();
    const garments = await listGarments(user.id);

    return NextResponse.json({
      data: garments.map(toGarmentResponse),
    });
  } catch (error) {
    return internalError(request, error);
  }
};

export const POST = async (request: Request) => {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorized(request);
    }

    let input;

    try {
      input = garmentInputSchema.parse(await request.json());
    } catch (error) {
      return invalidRequest(request, error);
    }

    await ensureGarmentIndexes();
    const garment = await createGarment(user.id, input);

    return NextResponse.json(
      { data: toGarmentResponse(garment) },
      { status: 201 },
    );
  } catch (error) {
    return internalError(request, error);
  }
};
