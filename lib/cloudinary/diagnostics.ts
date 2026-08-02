import "server-only";

type CloudinaryErrorLike = {
  code?: unknown;
  http_code?: unknown;
  message?: unknown;
  name?: unknown;
};

const redactMessage = (message: string) => {
  const configuredSecrets = [
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET,
  ].filter((value): value is string => Boolean(value));

  return configuredSecrets
    .reduce(
      (safeMessage, secret) => safeMessage.replaceAll(secret, "[redacted]"),
      message,
    )
    .replace(/data:[^,\s]+,[^\s]+/gi, "[redacted-image-data]")
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .slice(0, 500);
};

export const getCloudinaryErrorDiagnostic = (error: unknown) => {
  const candidate =
    error && typeof error === "object" ? (error as CloudinaryErrorLike) : {};

  return {
    errorCode:
      typeof candidate.code === "string" || typeof candidate.code === "number"
        ? String(candidate.code)
        : undefined,
    errorName:
      typeof candidate.name === "string" ? candidate.name.slice(0, 120) : "UnknownError",
    httpCode:
      typeof candidate.http_code === "number" ? candidate.http_code : undefined,
    message:
      typeof candidate.message === "string"
        ? redactMessage(candidate.message)
        : "No provider message was returned.",
  };
};

export const logCloudinaryCutoutFailure = ({
  error,
  garmentId,
  stage,
}: {
  error: unknown;
  garmentId: string;
  stage: "request" | "webhook" | "download";
}) => {
  console.error(
    "cloudinary.cutout.failure",
    JSON.stringify({
      event: "cloudinary.cutout.failure",
      garmentId,
      stage,
      ...getCloudinaryErrorDiagnostic(error),
    }),
  );
};
