import { Skeleton } from "@pbd/components/ui/skeleton"
import type { JSX } from "react"

const SECTION_KEYS = ["winners", "forfeits"] as const

const LEAGUE_KEYS = ["premiership", "championship"] as const

export const GameweekResultsSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-center gap-4">
      {LEAGUE_KEYS.map((leagueKey) => (
        <div key={leagueKey} className="flex flex-col items-center gap-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
      ))}
    </div>

    {SECTION_KEYS.map((sectionKey) => (
      <div key={sectionKey} className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-2.5 w-20 shrink-0" />
          <div className="h-px flex-1 bg-accent" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {LEAGUE_KEYS.map((leagueKey) => (
            <div
              key={leagueKey}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3"
            >
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
)
