import type { ReactNode } from "react";
import AppHeader from "@/components/wardrobe/AppHeader";
import { WardrobeProvider } from "@/components/wardrobe/WardrobeContext";

const WardrobeLayout = ({ children }: { children: ReactNode }) => (
  <WardrobeProvider>
    <AppHeader />
    <main id="main-content" tabIndex={-1}>
      {children}
    </main>
  </WardrobeProvider>
);

export default WardrobeLayout;
