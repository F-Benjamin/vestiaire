import { NextResponse } from "next/server";

/**
 * Une première route API très simple.
 * Ouvrez /api/health pour vérifier que le serveur Next.js répond.
 */
export const GET = () =>
  NextResponse.json({
    status: "ok",
    application: "Vestiaire",
    timestamp: new Date().toISOString(),
  });
