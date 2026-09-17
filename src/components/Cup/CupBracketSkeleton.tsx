import { Skeleton } from "@pbd/components/ui/skeleton"
import { cn } from "@pbd/lib/className"
import { CUP_ROUNDS, CUP_ROUND_TIE_COUNTS } from "@pbd/lib/constants/Cups"
import { skeletonKeys } from "@pbd/lib/skeletonKeys"
import type { JSX } from "react"

const ROW_HEIGHT = "h-[46px] rounded-xl"

export const CupBracketSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-3">
    {CUP_ROUNDS.map((round) => (
      <section key={round} className="rounded-2xl border border-border/60 bg-card/40 p-3">
        <div className="mb-2.5 flex items-baseline justify-between gap-2 px-1">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="flex flex-col gap-2">
          {skeletonKeys(`cup-${round}`, CUP_ROUND_TIE_COUNTS[round]).map((key) => (
            <Skeleton
              key={key}
              className={cn(ROW_HEIGHT, round === "final" && "h-[62px] rounded-2xl")}
            />
          ))}
        </div>
      </section>
    ))}
  </div>
)
