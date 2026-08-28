import { Skeleton } from "@pbd/components/ui/skeleton"
import type { JSX } from "react"

const CHIP_SLOTS = Array.from({ length: 3 }, (_, index) => `forfeit-chip-slot-${index}`)

export const ForfeitDetailSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-5 w-1/3" />
      <div className="mt-1 flex flex-wrap gap-1.5">
        {CHIP_SLOTS.map((slot) => (
          <Skeleton key={slot} className="h-6 w-20 rounded-full" />
        ))}
      </div>
    </div>
    <Skeleton className="aspect-video w-full rounded-2xl" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
  </div>
)
