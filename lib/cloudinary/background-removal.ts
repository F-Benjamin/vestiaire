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

export const requestBackgroundRemoval = async ({
  garmentId,
  contentType,
  image,
  notificationUrl,
  ownerId,
}: {
  garmentId: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  image: ArrayBuffer;
  notificationUrl: string;
  ownerId: string;
}): Promise<CloudinaryBackgroundRemoval> => {
  configureCloudinary();
  const ownerHash = createHash("sha256").update(ownerId).digest("hex");
  const base64 = Buffer.from(image).toString("base64");
  const result = await cloudinary.uploader.upload(
    `data:${contentType};base64,${base64}`,
    {
      background_removal: "cloudinary_ai",
      notification_url: notificationUrl,
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

export const verifyCloudinaryNotification = (
  body: string,
  signature: string | null,
  timestamp: string | null,
) => {
  if (!signature || !timestamp || !Number.isFinite(Number(timestamp))) {
    return false;
  }

  configureCloudinary();
  return cloudinary.utils.verifyNotificationSignature(
    body,
    Number(timestamp),
    signature,
    15 * 60,
  );
};

export const downloadBackgroundRemovedImage = async (publicId: string) => {
  configureCloudinary();
  const url = cloudinary.url(publicId, {
    format: "png",
    resource_type: "image",
    secure: true,
    sign_url: true,
    type: "authenticated",
  });
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Cloudinary cutout download failed with status ${response.status}.`);
  }

  return response.arrayBuffer();
};

export const deleteCloudinaryAsset = async (publicId: string) => {
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: "image",
    type: "authenticated",
  });
};
