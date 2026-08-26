import { TransactionArrow } from "@pbd/components/Transactions/TransactionArrow"
import { SkeletonText } from "@pbd/components/SkeletonText/SkeletonText"
import { Select, SelectTrigger, SelectValue } from "@pbd/components/ui/select"
import { Skeleton } from "@pbd/components/ui/skeleton"
import { skeletonKeys } from "@pbd/lib/skeletonKeys"
import type { JSX } from "react"

const GROUP_COUNT = 3

const ROWS_PER_GROUP = 2

export const TransactionsSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-4">
    <Select disabled defaultValue="loading">
      <SelectTrigger className="w-36" aria-label="Game week">
        <SelectValue>Game Week</SelectValue>
      </SelectTrigger>
    </Select>

    <div className="flex flex-col gap-5">
      {skeletonKeys("group", GROUP_COUNT).map((groupKey) => (
        <section key={groupKey} className="flex flex-col gap-2">
          <header className="flex items-center gap-2.5">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">
                <SkeletonText className="w-28" />
              </p>
              <p className="truncate text-[11px]">
                <SkeletonText className="w-20" />
              </p>
            </div>

            <p className="shrink-0 text-[11px] font-medium">
              <SkeletonText className="w-16" />
            </p>
          </header>

          <div className="flex flex-col gap-2">
            {skeletonKeys(`${groupKey}-move`, ROWS_PER_GROUP).map((rowKey) => (
              <div
                key={rowKey}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5"
              >
                <div className="min-w-0 flex-1 text-right">
                  <p className="truncate text-sm font-semibold">
                    <SkeletonText className="w-20" />
                  </p>
                  <p className="truncate text-[11px] uppercase tracking-wide">
                    <SkeletonText className="w-8" />
                  </p>
                </div>

                <div className="flex w-24 shrink-0 flex-col items-center gap-1">
                  <TransactionArrow />
                  <Skeleton className="h-3.5 w-14 rounded" />
                </div>

                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-semibold">
                    <SkeletonText className="w-20" />
                  </p>
                  <p className="truncate text-[11px] uppercase tracking-wide">
                    <SkeletonText className="w-8" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  </div>
)
