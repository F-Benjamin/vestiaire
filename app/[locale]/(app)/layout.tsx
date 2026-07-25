import type { ReactNode } from "react";
import AppHeader from "@/components/wardrobe/AppHeader";
import { WardrobeProvider } from "@/components/wardrobe/WardrobeContext";
import { getSession } from "@/lib/auth-session";

const WardrobeLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getSession();

  return (
    <WardrobeProvider>
      <AppHeader
        user={
          session
            ? {
                name: session.user.name,
                email: session.user.email,
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
