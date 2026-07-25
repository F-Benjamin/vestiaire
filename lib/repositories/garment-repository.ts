import "server-only";
import { ObjectId, type Collection, type WithId } from "mongodb";
import {
  garmentInputSchema,
  garmentUpdateSchema,
  type GarmentDocument,
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
    getGarmentsCollection()
      .createIndex(
        { ownerId: 1, updatedAt: -1 },
        { name: "garments_by_owner_and_update" },
      )
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

  return getGarmentsCollection().findOneAndUpdate(
    { _id: objectId, ownerId },
    {
      $set: {
        ...update,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );
};

export const deleteGarment = async (
  ownerId: string,
  id: string,
): Promise<boolean> => {
  const objectId = toObjectId(id);

  if (!objectId) {
    return false;
  }

  const result = await getGarmentsCollection().deleteOne({
    _id: objectId,
    ownerId,
  });

  return result.deletedCount === 1;
};
