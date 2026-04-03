import type { JSX } from "react";
import { GwLoserBanner } from "./GwLoserBanner";
import { TrueFocus } from "@pbd/components/ui/TrueFocus/TrueFocus";

export const Header = (): JSX.Element => (
  <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
    <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
      <TrueFocus
        sentence="Playball Draft"
        manualMode={false}
        blurAmount={5}
        borderColor="#5227FF"
        animationDuration={0.5}
        pauseBetweenAnimations={1}
        fontSize="1.25rem"
      />
      <GwLoserBanner />
    </div>
  </header>
);
