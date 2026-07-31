import { timingSafeEqual } from "node:crypto";
import { purgeExpiredOriginals } from "@/lib/cleanup-expired-originals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const secretsMatch = (received: string, expected: string) => {
  const receivedBytes = Buffer.from(received);
  const expectedBytes = Buffer.from(expected);

  return (
    receivedBytes.length === expectedBytes.length &&
    timingSafeEqual(receivedBytes, expectedBytes)
  );
};

export const POST = async (request: Request) => {
  const secret = process.env.WEARSONA_CRON_SECRET?.trim();
  const authorization = request.headers.get("authorization");
  const received = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  if (!secret || !secretsMatch(received, secret)) {
    return new Response(null, { status: 401 });
  }

  const deleted = await purgeExpiredOriginals();
  return Response.json({ deleted });
};
