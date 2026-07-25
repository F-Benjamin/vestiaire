import "server-only";
import { auth } from "@/lib/auth";

export const getAuthenticatedUser = async (request: Request) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session?.user ?? null;
};
