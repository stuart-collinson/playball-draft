import { Skeleton } from "@pbd/components/ui/skeleton"
import type { JSX } from "react"

const GROUP_KEYS = ["a", "b", "c"] as const

const ROW_KEYS = ["x", "y"] as const

export const TransactionsSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-4">
    <Skeleton className="h-9 w-36 rounded-md" />

    <div className="flex flex-col gap-5">
      {GROUP_KEYS.map((groupKey) => (
        <div key={groupKey} className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="h-2.5 w-20" />
          </div>

          {ROW_KEYS.map((rowKey) => (
            <div
              key={rowKey}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5"
            >
              <div className="flex flex-1 flex-col items-end gap-1.5">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-2.5 w-8" />
              </div>
              <div className="flex w-24 shrink-0 flex-col items-center gap-1.5">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-14 rounded" />
              </div>
              <div className="flex flex-1 flex-col items-start gap-1.5">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-2.5 w-8" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
)
