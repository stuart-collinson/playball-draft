import { ResultCardGlow } from "@pbd/components/Cards/ResultCardGlow"
import { SkeletonText } from "@pbd/components/SkeletonText/SkeletonText"
import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import type { JSX } from "react"

type GameweekResultSkeletonProps = {
  leagueSlug: LeagueSlug
}

export const GameweekResultSkeleton = ({
  leagueSlug,
}: GameweekResultSkeletonProps): JSX.Element => (
  <ResultCardGlow>
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
      <div className="relative">
        <div className="h-12 w-12 animate-pulse rounded-full bg-accent" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold leading-tight">
          <SkeletonText className="w-24" />
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{LEAGUE_LABELS[leagueSlug]}</p>
        <p className="mt-1 text-xl font-black">
          <SkeletonText className="w-10" />
          <span className="ml-1 text-sm font-medium text-muted-foreground">pts</span>
        </p>
      </div>
    </div>
  </ResultCardGlow>
)
