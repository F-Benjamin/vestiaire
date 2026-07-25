import "server-only";
import { z } from "zod";

const authEnvironmentSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
});

const localDevelopmentSecret =
  "vestiaire-local-only-secret-never-used-on-netlify";

export const getAuthSecret = () => {
  const configuredSecret = process.env.BETTER_AUTH_SECRET;

  if (!configuredSecret && !process.env.NETLIFY) {
    return localDevelopmentSecret;
  }

  return authEnvironmentSchema.parse({
    BETTER_AUTH_SECRET: configuredSecret,
  }).BETTER_AUTH_SECRET;
};
