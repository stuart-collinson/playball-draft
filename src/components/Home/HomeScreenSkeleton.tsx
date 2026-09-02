import { Skeleton } from "@pbd/components/ui/skeleton"
import { HOME_SCREEN_CLASSES } from "@pbd/lib/constants/Home"
import { skeletonKeys } from "@pbd/lib/skeletonKeys"
import { cn } from "@pbd/lib/utils/cn"
import type { JSX } from "react"

const PANEL_KEYS = skeletonKeys("home-panel", 2)

export const HomeScreenSkeleton = (): JSX.Element => (
  <div className={cn(HOME_SCREEN_CLASSES, "flex flex-col gap-4 border border-border bg-card p-4")}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
    <Skeleton className="h-16 w-full rounded-xl" />
    <Skeleton className="h-20 w-4/5" />
    <div className="grid flex-1 grid-cols-2 gap-3">
      {PANEL_KEYS.map((key) => (
        <Skeleton key={key} className="rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-12 w-full rounded-xl" />
  </div>
)
