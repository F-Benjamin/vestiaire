import "server-only";

export const isLocalDevelopment = () => {
  if (process.env.NODE_ENV !== "development") return false;

  return !process.env.NETLIFY || process.env.CONTEXT === "dev";
};

export const isLocalDevelopmentRequest = (host: string | null) => {
  if (!isLocalDevelopment() || !host) return false;

  const hostname = host.startsWith("[")
    ? host.slice(0, host.indexOf("]") + 1).toLowerCase()
    : host.split(":")[0]?.toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
};
