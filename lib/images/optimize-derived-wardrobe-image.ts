import sharp from "sharp";

export const MAX_DERIVED_WARDROBE_IMAGE_SIZE = 4 * 1024 * 1024;

const derivedImageWidths = [3200, 2560, 2048, 1600];
const derivedImageQualities = [88, 80, 72, 64];

export const optimizeDerivedWardrobeImage = async (bytes: ArrayBuffer) => {
  if (bytes.byteLength <= MAX_DERIVED_WARDROBE_IMAGE_SIZE) return bytes;

  const input = Buffer.from(bytes);

  for (const width of derivedImageWidths) {
    for (const quality of derivedImageQualities) {
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
