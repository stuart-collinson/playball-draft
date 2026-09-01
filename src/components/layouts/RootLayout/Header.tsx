import { GameweekLosers } from "@pbd/components/GameweekLosers"
import { APP_NAME } from "@pbd/lib/constants/app"
import type { JSX } from "react"

export const Header = (): JSX.Element => (
  <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
    <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="h-5 w-1 shrink-0 rounded-full bg-gradient-to-b from-prem-500 to-champ-500" />
        <span className="truncate text-lg font-black tracking-tight text-foreground">
          {APP_NAME}
        </span>
      </div>
      <GameweekLosers />
    </div>
  </header>
)
