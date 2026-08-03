import sharp from "sharp";

export const MAX_DERIVED_WARDROBE_IMAGE_SIZE = 4 * 1024 * 1024;

const derivedImageWidths = [3200, 2560, 2048, 1600];
const derivedImageQualities = [88, 80, 72, 64];

export const optimizeDerivedWardrobeImage = async (bytes: ArrayBuffer) => {
  const input = Buffer.from(bytes);

  const normalized = await sharp(input, { failOn: "none" })
    .rotate()
    .webp({ quality: derivedImageQualities[0] })
    .toBuffer();

  if (normalized.byteLength <= MAX_DERIVED_WARDROBE_IMAGE_SIZE) {
    return normalized.buffer.slice(
      normalized.byteOffset,
      normalized.byteOffset + normalized.byteLength,
    );
  }

  for (const width of derivedImageWidths) {
    for (const quality of derivedImageQualities.slice(1)) {
      const optimized = await sharp(input, { failOn: "none" })
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();

      if (optimized.byteLength <= MAX_DERIVED_WARDROBE_IMAGE_SIZE) {
        return optimized.buffer.slice(
          optimized.byteOffset,
          optimized.byteOffset + optimized.byteLength,
        );
      }
    }
  }

  throw new Error("derived_image_too_large");
};
