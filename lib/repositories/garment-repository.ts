import "server-only";
import { ObjectId, type Collection, type WithId } from "mongodb";
import {
  garmentInputSchema,
  garmentUpdateSchema,
  type GarmentDocument,
  type GarmentCutout,
  type GarmentInput,
  type GarmentUpdate,
} from "@/lib/schemas/garment";
import { getDatabase } from "@/lib/mongodb/client";

type GarmentRepositoryGlobal = typeof globalThis & {
  vestiaireGarmentIndexesPromise?: Promise<void>;
};

const garmentRepositoryGlobal = globalThis as GarmentRepositoryGlobal;

const getGarmentsCollection = (): Collection<GarmentDocument> =>
  getDatabase().collection<GarmentDocument>("garments");

const toObjectId = (id: string) =>
  ObjectId.isValid(id) ? new ObjectId(id) : null;

export const ensureGarmentIndexes = async () => {
  garmentRepositoryGlobal.vestiaireGarmentIndexesPromise ??=
    Promise.all([
      getGarmentsCollection().createIndex(
        { ownerId: 1, updatedAt: -1 },
        { name: "garments_by_owner_and_update" },
      ),
      getGarmentsCollection().createIndex(
        { "cutout.providerAssetId": 1 },
        {
          name: "garments_by_cutout_asset",
          partialFilterExpression: {
            "cutout.providerAssetId": { $type: "string" },
          },
        },
      ),
      getGarmentsCollection().createIndex(
        { "cutout.originalDeleteAfter": 1 },
        {
          name: "garments_by_original_expiry",
          partialFilterExpression: {
            "cutout.status": "accepted",
            originalImageKey: { $type: "string" },
          },
        },
      ),
    ])
      .then(() => undefined)
      .catch((error: unknown) => {
        garmentRepositoryGlobal.vestiaireGarmentIndexesPromise = undefined;
        throw error;
      });

  await garmentRepositoryGlobal.vestiaireGarmentIndexesPromise;
};

export const createGarment = async (
  ownerId: string,
  input: GarmentInput,
): Promise<WithId<GarmentDocument>> => {
  const garment = garmentInputSchema.parse(input);
  const now = new Date();
  const document: GarmentDocument = {
    ...garment,
    ownerId,
    originalImageKey: garment.imageKey,
    createdAt: now,
    updatedAt: now,
  };
  const collection = getGarmentsCollection();
  const result = await collection.insertOne(document);

  return { ...document, _id: result.insertedId };
};

export const listGarments = async (
  ownerId: string,
): Promise<WithId<GarmentDocument>[]> => {
  const collection = getGarmentsCollection();

  return collection
    .find({ ownerId })
    .sort({ updatedAt: -1 })
    .limit(200)
    .toArray();
};

export const listAllGarments = async (
  ownerId: string,
): Promise<WithId<GarmentDocument>[]> =>
  getGarmentsCollection()
    .find({ ownerId })
    .sort({ createdAt: 1 })
    .toArray();

export const countGarments = async (ownerId: string) =>
  getGarmentsCollection().countDocuments({ ownerId });

export const getGarment = async (
  ownerId: string,
  id: string,
): Promise<WithId<GarmentDocument> | null> => {
  const objectId = toObjectId(id);

  if (!objectId) {
    return null;
  }

  return getGarmentsCollection().findOne({ _id: objectId, ownerId });
};

export const isGarmentImageReferenced = async (
  ownerId: string,
  imageKey: string,
) =>
  (await getGarmentsCollection().countDocuments(
    {
      ownerId,
      $or: [
        { imageKey },
        { originalImageKey: imageKey },
        { "cutout.imageKey": imageKey },
      ],
    },
    { limit: 1 },
  )) > 0;

export const updateGarment = async (
  ownerId: string,
  id: string,
  input: GarmentUpdate,
): Promise<WithId<GarmentDocument> | null> => {
  const objectId = toObjectId(id);

  if (!objectId) {
    return null;
  }

  const update = garmentUpdateSchema.parse(input);
  const suggestedFields = [
    "category",
    "colors",
    "seasons",
    "styles",
    "patterns",
  ].filter((field) => field in update);
  const unsetSuggestions: Record<string, ""> = Object.fromEntries(
    suggestedFields.map((field) => [`analysis.attributes.${field}`, ""]),
  );

  return getGarmentsCollection().findOneAndUpdate(
    { _id: objectId, ownerId },
    {
      $set: {
        ...update,
        updatedAt: new Date(),
      },
      ...(suggestedFields.length ? { $unset: unsetSuggestions } : {}),
    },
    { returnDocument: "after" },
  );
};

type PendingCutout = Pick<
  GarmentCutout,
  "providerAssetId" | "providerPublicId" | "createdAt"
>;

export const queueGarmentCutout = async (
  ownerId: string,
  id: string,
  cutout: PendingCutout,
) => {
  const objectId = toObjectId(id);
  if (!objectId) return null;

  return getGarmentsCollection().findOneAndUpdate(
    { _id: objectId, ownerId },
    {
      $set: {
        cutout: { ...cutout, status: "pending" },
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );
};

export const getGarmentByCutoutAssetId = async (assetId: string) =>
  getGarmentsCollection().findOne({ "cutout.providerAssetId": assetId });

export const completeGarmentCutout = async (
  id: string,
  imageKey: string,
  confidence: number | undefined,
) =>
  getGarmentsCollection().findOneAndUpdate(
    { _id: new ObjectId(id), "cutout.status": "pending" },
    {
      $set: {
        "cutout.status": "ready",
        "cutout.imageKey": imageKey,
        ...(confidence === undefined ? {} : { "cutout.confidence": confidence }),
        "cutout.completedAt": new Date(),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

export const failGarmentCutout = async (
  id: string,
  failureReason: Extract<CutoutFailureReason, "provider_failed" | "download_failed"> = "provider_failed",
  failureCode?: string,
) =>
  getGarmentsCollection().findOneAndUpdate(
    { _id: new ObjectId(id), "cutout.status": "pending" },
    {
      $set: {
        "cutout.status": "failed",
        "cutout.failureReason": failureReason,
        ...(failureCode ? { "cutout.failureCode": failureCode } : {}),
        "cutout.failureAt": new Date(),
        "cutout.completedAt": new Date(),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

type CutoutFailureReason = NonNullable<GarmentCutout["failureReason"]>;

export const markGarmentCutoutUnavailable = async (ownerId: string, id: string) => {
  const objectId = toObjectId(id);
  if (!objectId) return null;

  const now = new Date();
  return getGarmentsCollection().findOneAndUpdate(
    {
      _id: objectId,
      ownerId,
      "cutout.status": { $nin: ["pending", "ready", "accepted"] },
    },
    {
      $set: {
        cutout: {
          status: "unavailable",
          failureReason: "not_configured",
          createdAt: now,
          failureAt: now,
        },
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );
};

export const failGarmentCutoutRequest = async (
  ownerId: string,
  id: string,
  failureReason: Exclude<CutoutFailureReason, "not_configured" | "provider_failed">,
) => {
  const objectId = toObjectId(id);
  if (!objectId) return null;

  const now = new Date();
  return getGarmentsCollection().findOneAndUpdate(
    {
      _id: objectId,
      ownerId,
      "cutout.status": { $nin: ["pending", "ready", "accepted"] },
    },
    {
      $set: {
        cutout: {
          status: "failed",
          failureReason,
          createdAt: now,
          failureAt: now,
        },
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );
};

export const acceptGarmentCutout = async (ownerId: string, id: string) => {
  const objectId = toObjectId(id);
  if (!objectId) return null;

  const garment = await getGarmentsCollection().findOne({
    _id: objectId,
    ownerId,
    "cutout.status": "ready",
    "cutout.imageKey": { $exists: true },
  });

  if (!garment?.cutout?.imageKey) return null;

  const now = new Date();
  const deleteAfter = new Date(now);
  deleteAfter.setUTCDate(deleteAfter.getUTCDate() + 30);

  return getGarmentsCollection().findOneAndUpdate(
    { _id: objectId, ownerId, "cutout.status": "ready" },
    {
      $set: {
        imageKey: garment.cutout.imageKey,
        "cutout.status": "accepted",
        "cutout.acceptedAt": now,
        "cutout.originalDeleteAfter": deleteAfter,
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );
};

export const listExpiredOriginals = async (now: Date) =>
  getGarmentsCollection()
    .find({
      originalImageKey: { $type: "string" },
      "cutout.status": "accepted",
      "cutout.originalDeleteAfter": { $lte: now },
      "cutout.originalDeletedAt": { $exists: false },
    })
    .limit(40)
    .toArray();

export const markOriginalDeleted = async (id: string) =>
  getGarmentsCollection().updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        originalImageKey: null,
        "cutout.originalDeletedAt": new Date(),
        updatedAt: new Date(),
      },
    },
  );

export const deleteGarment = async (
  ownerId: string,
  id: string,
): Promise<WithId<GarmentDocument> | null> => {
  const objectId = toObjectId(id);

  if (!objectId) {
    return null;
  }

  return getGarmentsCollection().findOneAndDelete({
    _id: objectId,
    ownerId,
  });
};

export const deleteGarmentsByOwner = async (ownerId: string) => {
  const result = await getGarmentsCollection().deleteMany({ ownerId });
  return result.deletedCount;
};
