"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { LuckMomentCard } from "@pbd/components/Luck/LuckMomentCard"
import { useLuckList } from "@pbd/hooks/luck/useLuckList"
import { gameweekLabel } from "@pbd/lib/gameweeks"
import type { JSX } from "react"

export const LuckTimeline = (): JSX.Element => {
  const { data: moments } = useLuckList()

  if (moments.length === 0)
    return (
      <EmptyState
        title="No Lucky Moments"
        message="Nothing recorded yet. The first jammy result of the season lands here."
      />
    )

  const seasons = [...new Set(moments.map((moment) => moment.season))]

  return (
    <div className="flex flex-col gap-8">
      {seasons.map((season) => (
        <section key={season} className="flex flex-col gap-4">
          {seasons.length > 1 && (
            <h2 className="font-black text-muted-foreground text-xs uppercase tracking-[0.3em]">
              {season}
            </h2>
          )}
          <div className="relative">
            <span
              aria-hidden
              className="absolute top-4 bottom-4 left-7 w-px bg-gradient-to-b from-green-400/50 via-border to-border"
            />
            <ol className="flex flex-col gap-6">
              {moments
                .filter((moment) => moment.season === season)
                .map((moment) => (
                  <li key={moment.id} className="relative flex items-start gap-3">
                    <div className="z-10 flex w-14 shrink-0 justify-center pt-4">
                      <span className="rounded-full border border-green-400/40 bg-background px-2 py-1 text-center font-black text-[10px] text-green-400 uppercase tracking-wide">
                        {gameweekLabel(moment.gameweek)}
                      </span>
                    </div>
                    <LuckMomentCard moment={moment} />
                  </li>
                ))}
            </ol>
          </div>
        </section>
      ))}
    </div>
  )
}
