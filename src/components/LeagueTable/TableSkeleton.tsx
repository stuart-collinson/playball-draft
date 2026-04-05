import type { JSX } from "react"
import { Skeleton } from "@pbd/components/ui/skeleton"

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const

export const TableSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-2">
    {SKELETON_KEYS.map((key) => (
      <div
        key={key}
        className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
      >
        <div className="flex w-10 shrink-0 flex-col items-center gap-1">
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-3 w-5" />
        </div>
      </div>
    ))}
  </div>
)
