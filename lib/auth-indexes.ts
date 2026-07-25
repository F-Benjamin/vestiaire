import "server-only";
import { getDatabase } from "@/lib/mongodb/client";

type AuthIndexGlobal = typeof globalThis & {
  vestiaireAuthIndexesPromise?: Promise<void>;
};

const authIndexGlobal = globalThis as AuthIndexGlobal;

const createAuthIndexes = async () => {
  const database = getDatabase();

  await Promise.all([
    database
      .collection("user")
      .createIndex({ email: 1 }, { name: "users_by_email", unique: true }),
    database
      .collection("account")
      .createIndex({ userId: 1 }, { name: "accounts_by_user" }),
    database
      .collection("session")
      .createIndex({ userId: 1 }, { name: "sessions_by_user" }),
    database
      .collection("session")
      .createIndex({ token: 1 }, { name: "sessions_by_token", unique: true }),
    database
      .collection("verification")
      .createIndex(
        { identifier: 1 },
        { name: "verifications_by_identifier" },
      ),
  ]);
};

export const ensureAuthIndexes = async () => {
  authIndexGlobal.vestiaireAuthIndexesPromise ??= createAuthIndexes().catch(
    (error) => {
      authIndexGlobal.vestiaireAuthIndexesPromise = undefined;
      throw error;
    },
  );

  await authIndexGlobal.vestiaireAuthIndexesPromise;
};
