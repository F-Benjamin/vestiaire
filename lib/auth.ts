import "server-only";
import { betterAuth } from "better-auth/minimal";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { deleteApplicationData } from "@/lib/account-cleanup";
import { queueAuthEmail } from "@/lib/email/auth-email";
import { getAuthSecret } from "@/lib/environment/auth";
import {
  getEmailEnvironment,
  isEmailAuthEnabled,
} from "@/lib/environment/email";
import { getDatabase, getMongoClient } from "@/lib/mongodb/client";

const database = getDatabase();
const client = getMongoClient();
const emailAuthEnabled = isEmailAuthEnabled();
if (emailAuthEnabled) getEmailEnvironment();

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
    requireEmailVerification: emailAuthEnabled,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    sendResetPassword: emailAuthEnabled
      ? async ({ user, url }, request) => {
          queueAuthEmail({
            kind: "reset-password",
            name: user.name,
            request,
            to: user.email,
            url,
          });
        }
      : undefined,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
  },
  emailVerification: emailAuthEnabled
    ? {
        sendVerificationEmail: async ({ user, url }, request) => {
          queueAuthEmail({
            kind: "verify-email",
            name: user.name,
            request,
            to: user.email,
            url,
          });
        },
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: false,
        expiresIn: 60 * 60,
      }
    : undefined,
  user: {
    deleteUser: {
      enabled: true,
      afterDelete: async (user) => {
        await deleteApplicationData(user.id);
      },
    },
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
      "/request-password-reset": {
        window: 60,
        max: 5,
      },
      "/send-verification-email": {
        window: 60,
        max: 5,
      },
      "/change-password": {
        window: 60,
        max: 5,
      },
      "/delete-user": {
        window: 60 * 10,
        max: 3,
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
