import { getAuthenticatedUser } from "@/lib/api/authenticated-user";
import { internalError, unauthorized } from "@/lib/api/json-response";
import {
  ensureGarmentIndexes,
  listAllGarments,
} from "@/lib/repositories/garment-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async (request: Request) => {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return unauthorized(request);
    }

    await ensureGarmentIndexes();
    const garments = await listAllGarments(user.id);
    const exportedAt = new Date();
    const payload = {
      format: "vestiaire-export",
      version: 1,
      exportedAt: exportedAt.toISOString(),
      profile: {
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
      },
      garments: garments.map(
        ({
          _id,
          name,
          category,
          colors,
          seasons,
          styles,
          patterns,
          imageKey,
          createdAt,
          updatedAt,
        }) => ({
          id: _id.toHexString(),
          name,
          category,
          colors,
          seasons,
          styles,
          patterns,
          hasImage: Boolean(imageKey),
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        }),
      ),
    };
    const date = exportedAt.toISOString().slice(0, 10);

    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="vestiaire-${date}.json"`,
        "Content-Type": "application/json; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return internalError(request, error);
  }
};
