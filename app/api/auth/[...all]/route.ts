import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { ensureAuthIndexes } from "@/lib/auth-indexes";

export const runtime = "nodejs";

const handlers = toNextJsHandler(auth);

export const GET = async (request: Request) => {
  await ensureAuthIndexes();
  return handlers.GET(request);
};

export const POST = async (request: Request) => {
  await ensureAuthIndexes();
  return handlers.POST(request);
};
