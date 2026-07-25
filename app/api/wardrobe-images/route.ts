import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/authenticated-user";
import { internalError, unauthorized } from "@/lib/api/json-response";
import { ensureSameOrigin } from "@/lib/api/mutation-request";
import { wardrobeImageErrorResponse } from "@/lib/api/wardrobe-image-response";
import {
  storeWardrobeImage,
  WardrobeImageError,
} from "@/lib/storage/wardrobe-image-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = async (request: Request) => {
  const forbidden = await ensureSameOrigin(request);

  if (forbidden) {
    return forbidden;
  }

  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorized(request);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return wardrobeImageErrorResponse(
        request,
        new WardrobeImageError("invalid_file"),
      );
    }

    const image = await storeWardrobeImage(user.id, file);

    return NextResponse.json(
      {
        data: {
          ...image,
          url: `/api/wardrobe-images/${image.key}`,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof WardrobeImageError) {
      return wardrobeImageErrorResponse(request, error);
    }

    return internalError(request, error);
  }
};
