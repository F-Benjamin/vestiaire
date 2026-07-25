import "server-only";
import { betterAuth } from "better-auth/minimal";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { getAuthSecret } from "@/lib/environment/auth";
import { getDatabase, getMongoClient } from "@/lib/mongodb/client";

const database = getDatabase();
const client = getMongoClient();

export const auth = betterAuth({
  appName: "Vestiaire",
  secret: getAuthSecret(),
  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "todaywardrobe.netlify.app",
      "*--todaywardrobe.netlify.app",
    ],
  },
  database: mongodbAdapter(database, { client }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 10,
      },
      "/sign-up/email": {
        window: 60,
        max: 5,
      },
    },
  },
  advanced: {
    cookiePrefix: "vestiaire",
    database: {
      generateId: "uuid",
    },
  },
  plugins: [nextCookies()],
});
