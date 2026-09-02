import { Skeleton } from "@pbd/components/ui/skeleton"
import { skeletonKeys } from "@pbd/lib/skeletonKeys"
import type { JSX } from "react"

const PANEL_KEYS = skeletonKeys("home-panel", 2)

export const HomeScreenSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-4 border border-border bg-card p-5 sm:rounded-2xl">
    <div className="flex items-center justify-between">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
    <Skeleton className="h-16 w-full rounded-xl" />
    <Skeleton className="h-24 w-4/5" />
    <div className="grid grid-cols-2 gap-3">
      {PANEL_KEYS.map((key) => (
        <Skeleton key={key} className="h-56 rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-12 w-full rounded-xl" />
  </div>
)
