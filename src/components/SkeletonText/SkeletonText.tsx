import { cn } from "@pbd/lib/utils/cn"
import type { JSX } from "react"

type SkeletonTextProps = {
  className?: string
}

export const SkeletonText = ({ className }: SkeletonTextProps): JSX.Element => (
  <span
    data-slot="skeleton"
    className={cn(
      "inline-block h-[0.7em] animate-pulse rounded-md bg-accent align-middle",
      className,
    )}
  />
)
