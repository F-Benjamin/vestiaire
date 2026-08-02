import "server-only";
import {
  MongoClient,
  ServerApiVersion,
  type Db,
} from "mongodb";
import { isLocalDevelopment } from "@/lib/environment/local-development";
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
  const databaseName = isLocalDevelopment()
    ? `${MONGODB_DB_NAME}_local`.slice(0, 64)
    : MONGODB_DB_NAME;

  return client.db(databaseName);
};

export const pingDatabase = async () => {
  const database = getDatabase();
  await database.command({ ping: 1 });
};
