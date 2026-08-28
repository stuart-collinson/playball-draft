import { Skeleton } from "@pbd/components/ui/skeleton"
import type { JSX } from "react"

const CARD_SLOTS = Array.from({ length: 12 }, (_, index) => `forfeit-card-slot-${index}`)

export const ForfeitsGridSkeleton = (): JSX.Element => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
    {CARD_SLOTS.map((slot) => (
      <div key={slot} className="flex flex-col gap-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="mt-1 aspect-square w-full rounded-2xl" />
      </div>
    ))}
  </div>
)
