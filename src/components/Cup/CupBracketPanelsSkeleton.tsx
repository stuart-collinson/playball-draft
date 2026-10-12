import { CupRoundPanel } from "@pbd/components/Cup/CupRoundPanel"
import { Skeleton } from "@pbd/components/ui/skeleton"
import { cn } from "@pbd/lib/className"
import { CUP_ROUNDS, CUP_ROUND_TIE_COUNTS } from "@pbd/lib/constants/Cups"
import { skeletonKeys } from "@pbd/lib/skeletonKeys"
import type { JSX } from "react"

export const CupBracketPanelsSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-3 xl:hidden">
    {CUP_ROUNDS.map((round) => {
      const isFinal = round === "final"

      return (
        <CupRoundPanel key={round} isFinal={isFinal}>
          <div className="mb-2.5 flex h-4 items-center justify-between gap-2 px-1">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex flex-col gap-2">
            {skeletonKeys(`cup-${round}`, CUP_ROUND_TIE_COUNTS[round]).map((key) => (
              <Skeleton
                key={key}
                className={cn("h-[42px] rounded-xl", isFinal && "h-[62px] rounded-2xl")}
              />
            ))}
          </div>
        </CupRoundPanel>
      )
    })}
  </div>
)
