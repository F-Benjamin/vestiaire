import "server-only";
import { createHash } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

const cloudinaryEnvironmentSchema = z.object({
  CLOUDINARY_CLOUD_NAME: z.string().trim().min(1),
  CLOUDINARY_API_KEY: z.string().trim().min(1),
  CLOUDINARY_API_SECRET: z.string().trim().min(1),
});

type CloudinaryBackgroundRemoval = {
  assetId: string;
  publicId: string;
};

export class CloudinaryCutoutDeliveryError extends Error {
  constructor(
    public readonly httpCode: number,
    public readonly detail?: string,
  ) {
    super(detail ?? `Cloudinary cutout download failed with status ${httpCode}.`);
    this.name = "CloudinaryCutoutDeliveryError";
  }
}

const sanitizeCloudinaryDeliveryError = (detail: string | null) =>
  detail
    ?.replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .slice(0, 240);

let isConfigured = false;

const configureCloudinary = () => {
  const environment = cloudinaryEnvironmentSchema.parse(process.env);

  if (!isConfigured) {
    cloudinary.config({
      cloud_name: environment.CLOUDINARY_CLOUD_NAME,
      api_key: environment.CLOUDINARY_API_KEY,
      api_secret: environment.CLOUDINARY_API_SECRET,
      secure: true,
    });
    isConfigured = true;
  }

  return environment;
};

export const isCloudinaryConfigured = () =>
  cloudinaryEnvironmentSchema.safeParse(process.env).success;

export const uploadOriginalForBackgroundRemoval = async ({
  garmentId,
  contentType,
  image,
  ownerId,
}: {
  garmentId: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  image: ArrayBuffer;
  ownerId: string;
}): Promise<CloudinaryBackgroundRemoval> => {
  configureCloudinary();
  const ownerHash = createHash("sha256").update(ownerId).digest("hex");
  const base64 = Buffer.from(image).toString("base64");
  const result = await cloudinary.uploader.upload(
    `data:${contentType};base64,${base64}`,
    {
      eager: [{ effect: "background_removal", format: "png" }],
      eager_async: true,
      overwrite: true,
      public_id: `wearsona/${ownerHash}/${garmentId}`,
      resource_type: "image",
      type: "authenticated",
    },
  );

  return {
    assetId: result.asset_id,
    publicId: result.public_id,
  };
};

export const downloadBackgroundRemovedImage = async (publicId: string) => {
  configureCloudinary();
  const url = cloudinary.url(publicId, {
    effect: "background_removal",
    format: "png",
    resource_type: "image",
    secure: true,
    sign_url: true,
    type: "authenticated",
  });
  const response = await fetch(url);

  if ([404, 420, 423].includes(response.status)) {
    return { status: "pending" as const };
  }

  if (!response.ok) {
    throw new CloudinaryCutoutDeliveryError(
      response.status,
      sanitizeCloudinaryDeliveryError(response.headers.get("x-cld-error")),
    );
  }

  return { status: "ready" as const, image: await response.arrayBuffer() };
};

export const deleteCloudinaryAsset = async (publicId: string) => {
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: "image",
    type: "authenticated",
  });
};
