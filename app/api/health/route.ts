import { NextResponse } from "next/server";
import { getRuntimeEnvironment } from "@/lib/runtime-environment";

export const GET = () =>
  NextResponse.json({
    status: "ok",
    application: "Wearsona",
    environment: getRuntimeEnvironment(),
    timestamp: new Date().toISOString(),
  });
