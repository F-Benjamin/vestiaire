import "server-only";
import {
  MongoClient,
  ServerApiVersion,
  type Db,
} from "mongodb";
import { getMongoEnvironment } from "@/lib/environment/mongodb";

type MongoGlobal = typeof globalThis & {
  vestiaireMongoClientPromise?: Promise<MongoClient>;
};

const mongoGlobal = globalThis as MongoGlobal;

const createMongoClient = () => {
  const { MONGODB_URI } = getMongoEnvironment();
  const client = new MongoClient(MONGODB_URI, {
    appName: "vestiaire-next",
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5_000,
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  return client.connect();
};

export const getMongoClient = async (): Promise<MongoClient> => {
  mongoGlobal.vestiaireMongoClientPromise ??= createMongoClient();

  try {
    return await mongoGlobal.vestiaireMongoClientPromise;
  } catch (error) {
    mongoGlobal.vestiaireMongoClientPromise = undefined;
    throw error;
  }
};

export const getDatabase = async (): Promise<Db> => {
  const client = await getMongoClient();
  const { MONGODB_DB_NAME } = getMongoEnvironment();

  return client.db(MONGODB_DB_NAME);
};

export const pingDatabase = async () => {
  const database = await getDatabase();
  await database.command({ ping: 1 });
};
