import "server-only";
import { getDictionary } from "@/i18n/dictionaries";
import { detectLocale } from "@/i18n/routing";
import { apiError } from "@/lib/api/json-response";
import { WardrobeImageError } from "@/lib/storage/wardrobe-image-store";

export const wardrobeImageErrorResponse = async (
  request: Request,
  error: WardrobeImageError,
) => {
  const locale = detectLocale(request.headers.get("accept-language"));
  const messages = (await getDictionary(locale)).api;

  switch (error.reason) {
    case "invalid_file":
      return apiError(400, "IMAGE_REQUIRED", messages.imageRequired);
    case "too_large":
      return apiError(413, "IMAGE_TOO_LARGE", messages.imageTooLarge);
    case "unsupported_type":
      return apiError(
        415,
        "IMAGE_TYPE_UNSUPPORTED",
        messages.imageTypeUnsupported,
      );
    case "quota_exceeded":
      return apiError(
        409,
        "IMAGE_QUOTA_EXCEEDED",
        messages.imageQuotaExceeded,
      );
    case "not_found":
      return apiError(404, "IMAGE_NOT_FOUND", messages.imageNotFound);
  }
};
