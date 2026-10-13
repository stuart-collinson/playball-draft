import { HalloweenBat } from "@pbd/components/Home/Halloween/HalloweenBat"
import { HalloweenWitch } from "@pbd/components/Home/Halloween/HalloweenWitch"
import { cn } from "@pbd/lib/className"
import type { JSX } from "react"

type Props = {
  className?: string
}

const TRAILING_BAT_DELAY = "1.2s"

export const HalloweenMoon = ({ className }: Props): JSX.Element => (
  <div aria-hidden className={cn("pointer-events-none relative h-28 w-36", className)}>
    <span className="halloween-moon absolute right-2 top-0 h-24 w-24 rounded-full" />
    <HalloweenWitch className="absolute right-1 top-2 w-24 -scale-x-100 motion-safe:animate-drift" />
    <HalloweenBat className="absolute left-0 top-3 w-7 motion-safe:animate-float" />
    <span
      className="absolute right-5 -top-1 w-5 motion-safe:animate-float"
      style={{ animationDelay: TRAILING_BAT_DELAY }}
    >
      <HalloweenBat className="block w-full" />
    </span>
  </div>
)
