import "server-only";
import { z } from "zod";

const enabledValues = new Set(["1", "true", "yes", "on"]);

const emailEnvironmentSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(3),
});

export const isEmailAuthEnabled = () =>
  enabledValues.has(
    (process.env.EMAIL_AUTH_ENABLED ?? "").trim().toLowerCase(),
  );

export const getEmailEnvironment = () => {
  if (!isEmailAuthEnabled()) {
    throw new Error(
      "L’envoi des e-mails d’authentification n’est pas activé.",
    );
  }

  return emailEnvironmentSchema.parse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
  });
};
