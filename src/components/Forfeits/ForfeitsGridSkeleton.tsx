import { Skeleton } from "@pbd/components/ui/skeleton"
import type { JSX } from "react"

const CARD_SLOTS = Array.from({ length: 12 }, (_, index) => `forfeit-card-slot-${index}`)

const FILTER_SLOTS = Array.from({ length: 4 }, (_, index) => `forfeit-filter-slot-${index}`)

export const ForfeitsGridSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-wrap items-center gap-2">
      {FILTER_SLOTS.map((slot) => (
        <Skeleton key={slot} className="h-8 w-28 rounded-md" />
      ))}
    </div>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {CARD_SLOTS.map((slot) => (
        <div key={slot} className="flex flex-col gap-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="mt-1 aspect-square w-full rounded-2xl" />
        </div>
      ))}
    </div>
  </div>
)
