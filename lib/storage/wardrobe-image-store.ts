import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { wardrobeImageKeySchema } from "@/lib/schemas/garment";

const STORE_NAME = "wardrobe-images";
export const MAX_WARDROBE_IMAGE_SIZE = 4 * 1024 * 1024;
export const MAX_WARDROBE_IMAGES_PER_USER = 500;

type SupportedImage = {
  contentType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
};

type WardrobeImageMetadata = {
  contentType: SupportedImage["contentType"];
  createdAt: string;
  ownerId: string;
  size: number;
};

const supportedContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export class WardrobeImageError extends Error {
  constructor(
    public readonly reason:
      | "invalid_file"
      | "not_found"
      | "quota_exceeded"
      | "too_large"
      | "unsupported_type",
  ) {
    super(reason);
    this.name = "WardrobeImageError";
  }
}

const getImageStore = () =>
  getStore({
    name: STORE_NAME,
    consistency: "strong",
  });

const getOwnerPrefix = (ownerId: string) =>
  `${createHash("sha256").update(ownerId).digest("hex")}/`;

const detectImage = (bytes: Uint8Array): SupportedImage | null => {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return { contentType: "image/jpeg", extension: "jpg" };
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { contentType: "image/png", extension: "png" };
  }

  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return { contentType: "image/webp", extension: "webp" };
  }

  return null;
};

const isOwnedMetadata = (
  metadata: Record<string, unknown>,
  ownerId: string,
): metadata is WardrobeImageMetadata =>
  metadata.ownerId === ownerId &&
  supportedContentTypes.includes(
    metadata.contentType as WardrobeImageMetadata["contentType"],
  ) &&
  typeof metadata.createdAt === "string" &&
  typeof metadata.size === "number";

export const storeWardrobeImage = async (ownerId: string, file: File) => {
  if (!file.size) {
    throw new WardrobeImageError("invalid_file");
  }

  if (file.size > MAX_WARDROBE_IMAGE_SIZE) {
    throw new WardrobeImageError("too_large");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const image = detectImage(bytes);

  if (!image) {
    throw new WardrobeImageError("unsupported_type");
  }

  const store = getImageStore();
  const ownerPrefix = getOwnerPrefix(ownerId);
  const { blobs } = await store.list({ prefix: ownerPrefix });

  if (blobs.length >= MAX_WARDROBE_IMAGES_PER_USER) {
    throw new WardrobeImageError("quota_exceeded");
  }

  const key = `${ownerPrefix}${randomUUID()}.${image.extension}`;
  const metadata: WardrobeImageMetadata = {
    contentType: image.contentType,
    createdAt: new Date().toISOString(),
    ownerId,
    size: file.size,
  };

  await store.set(key, bytes.buffer, {
    metadata,
    onlyIfNew: true,
  });

  return { key, contentType: image.contentType, size: file.size };
};

export const getOwnedWardrobeImage = async (
  ownerId: string,
  key: string,
  etag?: string,
) => {
  const parsedKey = wardrobeImageKeySchema.safeParse(key);

  if (!parsedKey.success || !key.startsWith(getOwnerPrefix(ownerId))) {
    throw new WardrobeImageError("not_found");
  }

  const entry = await getImageStore().getWithMetadata(key, {
    type: "arrayBuffer",
    ...(etag ? { etag } : {}),
  });

  if (!entry || !isOwnedMetadata(entry.metadata, ownerId)) {
    throw new WardrobeImageError("not_found");
  }

  return {
    data: entry.data,
    etag: entry.etag,
    metadata: entry.metadata,
  };
};

export const assertWardrobeImageOwnership = async (
  ownerId: string,
  key: string,
) => {
  const parsedKey = wardrobeImageKeySchema.safeParse(key);

  if (!parsedKey.success || !key.startsWith(getOwnerPrefix(ownerId))) {
    throw new WardrobeImageError("not_found");
  }

  const entry = await getImageStore().getMetadata(key);

  if (!entry || !isOwnedMetadata(entry.metadata, ownerId)) {
    throw new WardrobeImageError("not_found");
  }
};

export const deleteOwnedWardrobeImage = async (
  ownerId: string,
  key: string,
) => {
  await assertWardrobeImageOwnership(ownerId, key);
  await getImageStore().delete(key);
};
