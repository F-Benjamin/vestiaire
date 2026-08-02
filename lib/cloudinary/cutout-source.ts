import "server-only";
import sharp from "sharp";

const MAX_CLOUDINARY_CUTOUT_SOURCE_BYTES = 9 * 1024 * 1024;
const processingWidths = [4096, 3200, 2560];
const jpegQualities = [86, 78, 70];

export const optimizeCutoutSource = async ({
  contentType,
  image,
}: {
  contentType: "image/jpeg" | "image/png" | "image/webp";
  image: ArrayBuffer;
}) => {
  if (image.byteLength <= MAX_CLOUDINARY_CUTOUT_SOURCE_BYTES) {
    return { contentType, image };
  }

  const input = Buffer.from(image);

  for (const width of processingWidths) {
    for (const quality of jpegQualities) {
      const optimized = await sharp(input, { failOn: "none" })
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .jpeg({ mozjpeg: true, quality })
        .toBuffer();

      if (optimized.byteLength <= MAX_CLOUDINARY_CUTOUT_SOURCE_BYTES) {
        return {
          contentType: "image/jpeg" as const,
          image: optimized.buffer.slice(
            optimized.byteOffset,
            optimized.byteOffset + optimized.byteLength,
          ),
        };
      }
    }
  }

  throw new Error("Cutout source could not be optimized below the provider limit.");
};
