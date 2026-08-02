import { NextResponse } from "next/server";
import { toGarmentResponse } from "@/lib/api/garment-response";
import { getAuthenticatedUser } from "@/lib/api/authenticated-user";
import {
  garmentNotFound,
  internalError,
  unauthorized,
} from "@/lib/api/json-response";
import { ensureSameOrigin } from "@/lib/api/mutation-request";
import { restoreGarmentOriginal } from "@/lib/repositories/garment-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RestoreCutoutRouteContext = {
  params: Promise<{ id: string }>;
};

export const POST = async (
  request: Request,
  { params }: RestoreCutoutRouteContext,
) => {
  const forbidden = await ensureSameOrigin(request);
  if (forbidden) return forbidden;

  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorized(request);

    const { id } = await params;
    const garment = await restoreGarmentOriginal(user.id, id);
    if (!garment) return garmentNotFound(request);

    return NextResponse.json({ data: toGarmentResponse(garment) });
  } catch (error) {
    return internalError(request, error);
  }
};
