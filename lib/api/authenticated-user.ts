import "server-only";
import { auth } from "@/lib/auth";
import { getLocalAdminSession } from "@/lib/auth-development";

export const getAuthenticatedUser = async (request: Request) => {
  const localSession = getLocalAdminSession(request.headers.get("host"));
  if (localSession) return localSession.user;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return session?.user ?? null;
};
