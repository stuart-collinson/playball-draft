import type { JSX, ReactNode } from "react";
import { HeaderVisibility } from "@pbd/components/layouts/RootLayout/HeaderVisibility";
import { BottomNavigation } from "@pbd/components/layouts/RootLayout/BottomNavigation";

type RootLayoutProps = {
  children: ReactNode;
};

export const RootLayout = ({ children }: RootLayoutProps): JSX.Element => (
  <div className="flex min-h-screen flex-col">
    <HeaderVisibility />
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24">
      {children}
    </main>
    <BottomNavigation />
  </div>
);
