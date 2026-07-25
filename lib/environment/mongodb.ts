import "server-only";
import { z } from "zod";

const mongoEnvironmentSchema = z.object({
  MONGODB_URI: z
    .string()
    .trim()
    .regex(
      /^mongodb(?:\+srv)?:\/\//,
      "MONGODB_URI doit être une chaîne de connexion MongoDB.",
    ),
  MONGODB_DB_NAME: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .default("vestiaire"),
});

export type MongoEnvironment = z.infer<typeof mongoEnvironmentSchema>;

export const getMongoEnvironment = (): MongoEnvironment =>
  mongoEnvironmentSchema.parse({
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
  });
