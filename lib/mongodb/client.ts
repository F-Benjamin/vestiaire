import "server-only";
import {
  MongoClient,
  ServerApiVersion,
  type Db,
} from "mongodb";
import { getMongoEnvironment } from "@/lib/environment/mongodb";

type MongoGlobal = typeof globalThis & {
  vestiaireMongoClient?: MongoClient;
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

  return client;
};

export const getMongoClient = (): MongoClient => {
  mongoGlobal.vestiaireMongoClient ??= createMongoClient();

  return mongoGlobal.vestiaireMongoClient;
};

export const getDatabase = (): Db => {
  const client = getMongoClient();
  const { MONGODB_DB_NAME } = getMongoEnvironment();

  return client.db(MONGODB_DB_NAME);
};

export const pingDatabase = async () => {
  const database = getDatabase();
  await database.command({ ping: 1 });
};
