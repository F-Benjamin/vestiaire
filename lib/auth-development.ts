import "server-only";
import { isLocalDevelopmentRequest } from "@/lib/environment/local-development";

const developmentDate = new Date("2026-01-01T00:00:00.000Z");

export const localAdminUser = {
  id: "wearsona-local-admin",
  name: "Local admin",
  email: "local-admin@wearsona.test",
  emailVerified: true,
  image: null,
  createdAt: developmentDate,
  updatedAt: developmentDate,
};

export const localAdminSession = {
  user: localAdminUser,
  session: {
    id: "wearsona-local-admin-session",
    userId: localAdminUser.id,
    token: "local-development-session",
    expiresAt: new Date("2099-01-01T00:00:00.000Z"),
    createdAt: developmentDate,
    updatedAt: developmentDate,
    ipAddress: "127.0.0.1",
    userAgent: "Wearsona local development",
  },
};

export const getLocalAdminSession = (host: string | null) =>
  isLocalDevelopmentRequest(host) ? localAdminSession : null;
