import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getDictionary } from "@/i18n/dictionaries";
import { detectLocale } from "@/i18n/routing";

type ApiErrorCode =
  | "GARMENT_NOT_FOUND"
  | "INTERNAL_ERROR"
  | "INVALID_REQUEST"
  | "UNAUTHORIZED";

export const apiError = (
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: unknown,
) =>
  NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details === undefined ? {} : { details }),
      },
    },
    { status },
  );

const getApiMessages = async (request: Request) => {
  const locale = detectLocale(request.headers.get("accept-language"));
  return (await getDictionary(locale)).api;
};

export const invalidRequest = async (request: Request, error: unknown) => {
  const messages = await getApiMessages(request);

  if (error instanceof ZodError) {
    return apiError(
      400,
      "INVALID_REQUEST",
      messages.invalidRequest,
      error.issues.map(({ code, path }) => ({ code, path })),
    );
  }

  return apiError(400, "INVALID_REQUEST", messages.invalidJson);
};

export const unauthorized = async (request: Request) => {
  const messages = await getApiMessages(request);
  return apiError(401, "UNAUTHORIZED", messages.unauthorized);
};

export const garmentNotFound = async (request: Request) => {
  const messages = await getApiMessages(request);
  return apiError(404, "GARMENT_NOT_FOUND", messages.garmentNotFound);
};

export const internalError = async (request: Request, error: unknown) => {
  const errorName = error instanceof Error ? error.name : "UnknownError";
  console.error(`Garment API failed: ${errorName}`);

  const messages = await getApiMessages(request);
  return apiError(500, "INTERNAL_ERROR", messages.internalError);
};
