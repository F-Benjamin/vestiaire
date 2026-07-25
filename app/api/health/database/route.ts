import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { pingDatabase } from "@/lib/mongodb/client";
import { getRuntimeEnvironment } from "@/lib/runtime-environment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    await pingDatabase();

    return NextResponse.json({
      status: "ok",
      database: "connected",
      environment: getRuntimeEnvironment(),
    });
  } catch (error) {
    const reason =
      error instanceof ZodError ? "not_configured" : "unavailable";

    if (reason === "unavailable") {
      const errorName = error instanceof Error ? error.name : "UnknownError";
      console.error(`MongoDB health check failed: ${errorName}`);
    }

    return NextResponse.json(
      {
        status: "error",
        database: reason,
        environment: getRuntimeEnvironment(),
      },
      { status: 503 },
    );
  }
};
