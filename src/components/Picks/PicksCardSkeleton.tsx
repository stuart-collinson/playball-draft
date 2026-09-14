import { SkeletonText } from "@pbd/components/SkeletonText/SkeletonText"
import { Skeleton } from "@pbd/components/ui/skeleton"
import type { JSX } from "react"

export const PicksCardSkeleton = (): JSX.Element => (
  <div className="relative pt-4">
    <div className="absolute left-1/2 top-0 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-border bg-card">
      <Skeleton className="h-2.5 w-3" />
    </div>

    <div className="flex h-full flex-col rounded-xl border border-border bg-card px-2.5 pb-3 pt-6 text-center">
      <p className="text-sm font-bold leading-snug">
        <SkeletonText className="w-16" />
      </p>

      <p className="mt-0.5 text-[10px]">
        <SkeletonText className="w-12" />
      </p>

      <div className="my-2 h-px bg-border" />

      <p className="text-[11px] font-medium leading-tight">
        <SkeletonText className="w-14" />
      </p>

      <p className="mt-0.5 text-[10px]">
        <SkeletonText className="w-8" />
      </p>
    </div>
  </div>
)
