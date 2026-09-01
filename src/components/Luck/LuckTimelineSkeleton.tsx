import { Skeleton } from "@pbd/components/ui/skeleton"
import { skeletonKeys } from "@pbd/lib/skeletonKeys"
import type { JSX } from "react"

const ROW_SLOTS = skeletonKeys("luck-timeline-slot", 5)

export const LuckTimelineSkeleton = (): JSX.Element => (
  <ol className="relative flex flex-col gap-6">
    <span aria-hidden className="absolute top-4 bottom-4 left-7 w-px bg-border" />
    {ROW_SLOTS.map((slot) => (
      <li key={slot} className="relative flex items-start gap-3">
        <div className="z-10 flex w-14 shrink-0 justify-center pt-4">
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </li>
    ))}
  </ol>
)
