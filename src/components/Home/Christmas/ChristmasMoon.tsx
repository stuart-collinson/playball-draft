import { ChristmasSleigh } from "@pbd/components/Home/Christmas/ChristmasSleigh"
import { cn } from "@pbd/lib/className"
import type { JSX } from "react"

type Props = {
  className?: string
}

export const ChristmasMoon = ({ className }: Props): JSX.Element => (
  <div aria-hidden className={cn("pointer-events-none relative h-28 w-36", className)}>
    <span className="christmas-moon absolute right-2 top-0 h-24 w-24 rounded-full" />
    <ChristmasSleigh className="absolute right-1 top-6 w-28 -scale-x-100 motion-safe:animate-drift" />
  </div>
)
