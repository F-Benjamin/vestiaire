import type { ReactNode } from "react";
import AppHeader from "@/components/wardrobe/AppHeader";
import { WardrobeProvider } from "@/components/wardrobe/WardrobeContext";
import type { WardrobeItem } from "@/components/wardrobe/wardrobe.types";
import { toGarmentResponse } from "@/lib/api/garment-response";
import { getSession } from "@/lib/auth-session";
import {
  ensureGarmentIndexes,
  listGarments,
} from "@/lib/repositories/garment-repository";

const WardrobeLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getSession();
  let initialItems: WardrobeItem[] = [];

  if (session) {
    await ensureGarmentIndexes();
    initialItems = (await listGarments(session.user.id)).map(toGarmentResponse);
  }

  return (
    <WardrobeProvider initialItems={initialItems}>
      <AppHeader
        user={
          session
            ? {
                name: session.user.name,
              }
            : null
        }
      />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </WardrobeProvider>
  );
};

export default WardrobeLayout;
