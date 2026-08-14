"use client"

import { RankBadge } from "@pbd/components/LeagueTable/RankBadge"
import PlayerDetails from "@pbd/components/Modals/PlayerDetails"
import { useRankMaps } from "@pbd/hooks/fpl/useRankMaps"
import { useScoringBreakdown } from "@pbd/hooks/fpl/useScoringBreakdown"
import { LEAGUE_IDS, LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import type { ScoringCategory } from "@pbd/lib/fpl/scoring"
import type { PlayerDialogData } from "@pbd/types/player.types"
import type { JSX } from "react"
import { useState } from "react"

type Props = {
  leagueIds: number[]
  category: ScoringCategory
}

// Singular unit per category for the count sub-label; bonus has no separate
// count (its value IS the points), so it shows only the points.
const CATEGORY_UNIT: Record<ScoringCategory, string | null> = {
  goals: "goal",
  assists: "assist",
  defcon: "def con",
  saves: "save",
  cleanSheets: "clean sheet",
  bonus: null,
}

const countLabel = (category: ScoringCategory, count: number): string => {
  const unit = CATEGORY_UNIT[category]
  if (!unit) return "Pts"
  return `${count} ${unit}${count === 1 ? "" : "s"}`
}

export const ScoringBreakdownTable = ({ leagueIds, category }: Props): JSX.Element => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDialogData | null>(null)

  const { data } = useScoringBreakdown(leagueIds)
  const { overallRankMap, leagueRankMap } = useRankMaps()

  const rows = [...data].sort(
    (a, b) => b.categories[category].points - a.categories[category].points,
  )

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-10 text-center">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
          No Points Yet
        </p>
        <p className="text-xs text-muted-foreground">
          The breakdown fills in once Gameweek 1 kicks off.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {rows.map((entry, index) => {
          const { points, count } = entry.categories[category]

          return (
            <button
              type="button"
              key={entry.entryApiId}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/30"
              onClick={() =>
                setSelectedPlayer({
                  apiId: entry.entryApiId,
                  playerName: entry.managerName,
                  teamName: entry.teamName,
                  leagueName:
                    entry.leagueId === LEAGUE_IDS.PREMIERSHIP
                      ? LEAGUE_LABELS.premiership
                      : LEAGUE_LABELS.championship,
                  leagueId: entry.leagueId,
                  leaguePosition: leagueRankMap.get(entry.entryApiId) ?? 0,
                  // The modal's "Overall" is the cross-league standing, not
                  // this table's rank.
                  overallPosition: overallRankMap.get(entry.entryApiId) ?? 0,
                })
              }
            >
              <RankBadge rank={index + 1} />

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{entry.managerName}</p>
                <p className="truncate text-xs text-muted-foreground">{entry.teamName}</p>
              </div>

              <div className="w-24 shrink-0 text-right">
                <p className="text-base font-black tabular-nums text-foreground">{points}</p>
                <p className="text-[10px] text-muted-foreground/60">
                  {countLabel(category, count)}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <PlayerDetails
        open={selectedPlayer !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedPlayer(null)
        }}
        player={selectedPlayer}
      />
    </>
  )
}
