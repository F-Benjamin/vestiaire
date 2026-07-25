import "server-only";
import type { Collection, WithId } from "mongodb";
import {
  garmentInputSchema,
  type GarmentDocument,
  type GarmentInput,
} from "@/lib/schemas/garment";
import { getDatabase } from "@/lib/mongodb/client";

const getGarmentsCollection = async (): Promise<
  Collection<GarmentDocument>
> => {
  const database = await getDatabase();
  return database.collection<GarmentDocument>("garments");
};

export const ensureGarmentIndexes = async () => {
  const collection = await getGarmentsCollection();

  await collection.createIndex(
    { ownerId: 1, updatedAt: -1 },
    { name: "garments_by_owner_and_update" },
  );
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
  const collection = await getGarmentsCollection();
  const result = await collection.insertOne(document);

  return { ...document, _id: result.insertedId };
};

export const listGarments = async (
  ownerId: string,
): Promise<WithId<GarmentDocument>[]> => {
  const collection = await getGarmentsCollection();

  return collection
    .find({ ownerId })
    .sort({ updatedAt: -1 })
    .limit(200)
    .toArray();
};
