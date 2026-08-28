import { Skeleton } from "@pbd/components/ui/skeleton"
import type { JSX } from "react"

const ROW_SLOTS = Array.from({ length: 8 }, (_, index) => `forfeit-admin-row-slot-${index}`)

export const ForfeitAdminListSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-2">
    {ROW_SLOTS.map((slot) => (
      <div
        key={slot}
        className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3"
      >
        <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-3/5" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
)
