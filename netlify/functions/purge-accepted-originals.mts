import type { Config } from "@netlify/functions";

const purgeAcceptedOriginals = async () => {
  const baseUrl = process.env.URL;
  const secret = process.env.WEARSONA_CRON_SECRET;

  if (!baseUrl || !secret) {
    console.warn("Original image purge skipped: missing URL or WEARSONA_CRON_SECRET.");
    return;
  }

  const response = await fetch(`${baseUrl}/api/internal/purge-originals`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });

  if (!response.ok) {
    throw new Error(`Original image purge failed with status ${response.status}.`);
  }
};

export default purgeAcceptedOriginals;

export const config: Config = {
  schedule: "@daily",
};
