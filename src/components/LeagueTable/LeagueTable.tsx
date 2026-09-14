"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { PlayerDetails } from "@pbd/components/PlayerDetails/PlayerDetails"
import { RankBadge } from "@pbd/components/RankBadge/RankBadge"
import { useBootstrapStatic } from "@pbd/hooks/fpl/useBootstrapStatic"
import { useCurrentGwGoalsAndAssists } from "@pbd/hooks/fpl/useCurrentGwGoalsAndAssists"
import { useCurrentGwPoints } from "@pbd/hooks/fpl/useCurrentGwPoints"
import { useCurrentGwToPlay } from "@pbd/hooks/fpl/useCurrentGwToPlay"
import { useLeagueDetailsList } from "@pbd/hooks/fpl/useLeagueDetailsList"
import { useRankMaps } from "@pbd/hooks/fpl/useRankMaps"
import { fmtPts } from "@pbd/lib/format"
import { buildLeagueTableRows, countGameweeksPlayed } from "@pbd/lib/fpl/leagueTableRows"
import type { LeagueTableMode } from "@pbd/lib/fpl/leagueTableRows"
import type { PlayerDialogData } from "@pbd/types/player.types"
import type { JSX } from "react"
import { useMemo, useState } from "react"

type Props = {
  leagueIds: number[]
  mode: LeagueTableMode
}

const EMPTY_MESSAGES: Record<LeagueTableMode, string> = {
  total: "The table fills in once the first gameweek kicks off.",
  form: "Scores appear once the gameweek kicks off.",
}

export const LeagueTable = ({ leagueIds, mode }: Props): JSX.Element => {
  const leagues = useLeagueDetailsList(leagueIds)
  const { data: bootstrap } = useBootstrapStatic()
  const { data: toPlayMap } = useCurrentGwToPlay(leagueIds)
  const { data: returnsMap } = useCurrentGwGoalsAndAssists(leagueIds)
  const { data: pointsMap } = useCurrentGwPoints(leagueIds)
  const { overallRankMap, leagueRankMap } = useRankMaps()

  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDialogData | null>(null)

  const gameweeksPlayed = countGameweeksPlayed(
    bootstrap.events.current,
    leagues[0]?.league.start_event ?? 1,
  )

  const rows = useMemo(
    () =>
      buildLeagueTableRows({
        leagues,
        mode,
        gameweeksPlayed,
        toPlayMap,
        returnsMap,
        pointsMap,
      }),
    [leagues, mode, gameweeksPlayed, toPlayMap, returnsMap, pointsMap],
  )

  if (rows.length === 0)
    return <EmptyState title="No Standings Yet" message={EMPTY_MESSAGES[mode]} />

  return (
    <>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <button
            type="button"
            key={row.leagueEntryId}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/30"
            onClick={() =>
              setSelectedPlayer({
                apiId: row.leagueEntryId,
                playerName: row.playerName,
                teamName: row.teamName,
                leagueId: row.leagueId,
                leaguePosition: leagueRankMap.get(row.leagueEntryId) ?? 0,
                overallPosition: overallRankMap.get(row.leagueEntryId) ?? 0,
              })
            }
          >
            <RankBadge rank={row.rank} lastRank={row.lastRank} showArrows />

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{row.playerName}</p>
              <p className="truncate text-xs text-muted-foreground">{row.teamName}</p>
            </div>

            <div className="flex shrink-0 items-center gap-8">
              {mode === "total" && (
                <div className="w-10 text-right">
                  <p className="text-base font-bold tabular-nums text-muted-foreground">
                    {row.averagePoints.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">Avg Pts</p>
                </div>
              )}
              {mode === "form" && row.toPlay > 0 && (
                <p className="text-sm font-bold tabular-nums text-muted-foreground">
                  {row.toPlay} to play
                </p>
              )}
              <div className="w-10 text-right">
                <p className="text-base font-black tabular-nums text-foreground">
                  {fmtPts(mode === "total" ? row.total : row.gameweekScore)}
                </p>
                <p className="text-[10px] text-muted-foreground/60">Points</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <PlayerDetails player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
    </>
  )
}
