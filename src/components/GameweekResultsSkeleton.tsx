import { GameweekResultSkeleton } from "@pbd/components/Cards/GameweekResultSkeleton"
import { ResultSectionHeader } from "@pbd/components/ResultSectionHeader"
import { SkeletonText } from "@pbd/components/SkeletonText/SkeletonText"
import { LEAGUE_LABELS, LEAGUE_SLUGS } from "@pbd/lib/constants/fpl"
import type { JSX } from "react"

const SECTION_TYPES = ["winner", "loser"] as const

export const GameweekResultsSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-center gap-4">
      <div className="flex flex-col items-center">
        <span className="text-xs font-semibold text-muted-foreground">
          {LEAGUE_LABELS.premiership}
        </span>
        <span className="text-xl font-black">
          <SkeletonText className="w-14" />
        </span>
      </div>
      <span className="text-sm font-bold text-muted-foreground/40">vs</span>
      <div className="flex flex-col items-center">
        <span className="text-xs font-semibold text-muted-foreground">
          {LEAGUE_LABELS.championship}
        </span>
        <span className="text-xl font-black">
          <SkeletonText className="w-14" />
        </span>
      </div>
    </div>

    {SECTION_TYPES.map((type) => (
      <div key={type} className="flex flex-col gap-4">
        <ResultSectionHeader type={type} />
        <div className="grid grid-cols-2 gap-3">
          {LEAGUE_SLUGS.map((slug) => (
            <GameweekResultSkeleton key={slug} leagueSlug={slug} />
          ))}
        </div>
      </div>
    ))}
  </div>
)
