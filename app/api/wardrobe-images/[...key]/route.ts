import { getDictionary } from "@/i18n/dictionaries";
import { detectLocale } from "@/i18n/routing";
import { getAuthenticatedUser } from "@/lib/api/authenticated-user";
import {
  apiError,
  internalError,
  unauthorized,
} from "@/lib/api/json-response";
import { ensureSameOrigin } from "@/lib/api/mutation-request";
import { wardrobeImageErrorResponse } from "@/lib/api/wardrobe-image-response";
import { isGarmentImageReferenced } from "@/lib/repositories/garment-repository";
import {
  deleteOwnedWardrobeImage,
  getOwnedWardrobeImage,
  WardrobeImageError,
} from "@/lib/storage/wardrobe-image-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WardrobeImageRouteContext = {
  params: Promise<{ key: string[] }>;
};

export const GET = async (
  request: Request,
  { params }: WardrobeImageRouteContext,
) => {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorized(request);
    }

    const { key: keySegments } = await params;
    const key = keySegments.join("/");
    const image = await getOwnedWardrobeImage(
      user.id,
      key,
      request.headers.get("if-none-match") ?? undefined,
    );

    if (image.data === null) {
      return new Response(null, {
        status: 304,
        headers: image.etag ? { ETag: image.etag } : undefined,
      });
    }

    return new Response(image.data, {
      headers: {
        "Cache-Control": "private, max-age=86400",
        "Content-Length": String(image.metadata.size),
        "Content-Type": image.metadata.contentType,
        "X-Content-Type-Options": "nosniff",
        ...(image.etag ? { ETag: image.etag } : {}),
      },
    });
  } catch (error) {
    if (error instanceof WardrobeImageError) {
      return wardrobeImageErrorResponse(request, error);
    }

    return internalError(request, error);
  }
};

export const DELETE = async (
  request: Request,
  { params }: WardrobeImageRouteContext,
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

    const { key: keySegments } = await params;
    const key = keySegments.join("/");

    if (await isGarmentImageReferenced(user.id, key)) {
      const locale = detectLocale(request.headers.get("accept-language"));
      const messages = (await getDictionary(locale)).api;
      return apiError(409, "IMAGE_IN_USE", messages.imageInUse);
    }

    await deleteOwnedWardrobeImage(user.id, key);

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof WardrobeImageError) {
      return wardrobeImageErrorResponse(request, error);
    }

    return internalError(request, error);
  }
};
