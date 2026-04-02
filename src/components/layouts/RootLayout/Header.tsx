import type { JSX } from "react"
import { APP_NAME } from "@pbd/lib/constants/app"
import { NavPills } from "./NavPills"
import { SubPills } from "./SubPills"

export const Header = (): JSX.Element => (
  <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
    <div className="mx-auto max-w-5xl px-4">
      <div className="flex h-14 items-center justify-between">
        <span className="text-base font-bold tracking-tight text-foreground">{APP_NAME}</span>
        <NavPills />
      </div>
      <div className="flex h-9 items-center">
        <SubPills />
      </div>
    </div>
  </header>
)
