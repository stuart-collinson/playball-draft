import { Skeleton } from "@pbd/components/ui/skeleton"
import { skeletonKeys } from "@pbd/lib/skeletonKeys"
import type { JSX } from "react"

const CARD_SLOTS = skeletonKeys("cup-selector", 2)

export const CupSelectorSkeleton = (): JSX.Element => (
  <div className="grid gap-3 sm:grid-cols-2">
    {CARD_SLOTS.map((slot) => (
      <Skeleton key={slot} className="h-24 rounded-2xl" />
    ))}
  </div>
)
