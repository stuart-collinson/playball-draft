import { Skeleton } from "@pbd/components/ui/skeleton"
import { cn } from "@pbd/lib/className"
import {
  CUP_BRACKET_COLUMNS,
  CUP_BRACKET_GRID,
  CUP_BRACKET_PLACEMENT,
  CUP_BRACKET_WIDE_FRAME,
  CUP_ROUNDS,
} from "@pbd/lib/constants/Cups"
import type { JSX } from "react"

export const CupBracketWideSkeleton = (): JSX.Element => (
  <div className={CUP_BRACKET_WIDE_FRAME}>
    <div className={CUP_BRACKET_GRID}>
      {CUP_BRACKET_COLUMNS.map(({ key }) => (
        <div key={key} className="flex flex-col items-center gap-1 py-0.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-10" />
        </div>
      ))}
    </div>

    <div className={cn(CUP_BRACKET_GRID, "items-center gap-y-3")}>
      {CUP_ROUNDS.flatMap((round) =>
        CUP_BRACKET_PLACEMENT[round].map((placement) => (
          <div key={placement} className={placement}>
            <Skeleton
              className={cn("h-[75px] rounded-xl", round === "final" && "h-[131px] rounded-2xl")}
            />
          </div>
        )),
      )}
    </div>
  </div>
)
