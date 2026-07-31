import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/authenticated-user";
import { internalError, invalidRequest, unauthorized } from "@/lib/api/json-response";
import { ensureSameOrigin } from "@/lib/api/mutation-request";
import { MAX_WARDROBE_IMAGE_SIZE } from "@/lib/storage/wardrobe-image-store";
import { analyzeGarmentImage } from "@/lib/vision-analysis";

const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

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
    const filename = formData.get("filename");
    const image = formData.get("image");

    if (typeof filename !== "string" || !filename.trim()) {
      return invalidRequest(request, new Error("filename is required"));
    }

    const usableImage =
      image instanceof File &&
      image.size > 0 &&
      image.size <= MAX_WARDROBE_IMAGE_SIZE &&
      supportedImageTypes.has(image.type)
        ? image
        : undefined;

    try {
      const suggestion = await analyzeGarmentImage(filename, usableImage);
      return NextResponse.json({ data: suggestion });
    } catch (error) {
      const errorName = error instanceof Error ? error.name : "UnknownError";
      console.warn(`Garment image analysis fell back to filename: ${errorName}`);
      const suggestion = await analyzeGarmentImage(filename);
      return NextResponse.json({ data: suggestion });
    }
  } catch (error) {
    return internalError(request, error);
  }
};
