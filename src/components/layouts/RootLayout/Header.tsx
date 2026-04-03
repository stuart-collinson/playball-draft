import type { JSX } from "react"
import { GwLoserBanner } from "./GwLoserBanner"

export const Header = (): JSX.Element => (
  <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
    <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
      <span
        className="animate-shimmer shrink-0 bg-gradient-to-r from-prem-400 via-muted-foreground via-50% to-champ-400 bg-[length:200%_auto] bg-clip-text text-xl font-black tracking-tight text-transparent"
        style={{ WebkitBackgroundClip: "text" }}
      >
        Playball Draft
      </span>
      <GwLoserBanner />
    </div>
  </header>
)
