import { SkeletonText } from "@pbd/components/SkeletonText/SkeletonText"
import { Skeleton } from "@pbd/components/ui/skeleton"
import { skeletonKeys } from "@pbd/lib/skeletonKeys"
import type { JSX } from "react"

const DEFAULT_ROW_COUNT = 8

type TableSkeletonProps = {
  rowCount?: number
}

export const TableSkeleton = ({
  rowCount = DEFAULT_ROW_COUNT,
}: TableSkeletonProps): JSX.Element => (
  <div className="flex flex-col gap-2">
    {skeletonKeys("row", rowCount).map((key) => (
      <div
        key={key}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
      >
        <div className="flex w-10 shrink-0 flex-col items-center gap-0.5">
          <div className="flex h-8 w-8 items-center justify-center">
            <Skeleton className="h-4 w-5" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            <SkeletonText className="w-32" />
          </p>
          <p className="truncate text-xs">
            <SkeletonText className="w-24" />
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-8">
          <div className="w-10 text-right">
            <p className="text-base font-bold">
              <SkeletonText className="w-10" />
            </p>
            <p className="text-[10px]">
              <SkeletonText className="w-9" />
            </p>
          </div>
          <div className="w-10 text-right">
            <p className="text-base font-black">
              <SkeletonText className="w-8" />
            </p>
            <p className="text-[10px]">
              <SkeletonText className="w-7" />
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
)
