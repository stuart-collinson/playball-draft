"use client"

import { ManagerTable } from "@pbd/components/ManagerTable/ManagerTable"
import { useBootstrapStatic } from "@pbd/hooks/fpl/useBootstrapStatic"
import { useCurrentGwGoalsAndAssists } from "@pbd/hooks/fpl/useCurrentGwGoalsAndAssists"
import { useCurrentGwPoints } from "@pbd/hooks/fpl/useCurrentGwPoints"
import { useCurrentGwToPlay } from "@pbd/hooks/fpl/useCurrentGwToPlay"
import { useLeagueDetailsList } from "@pbd/hooks/fpl/useLeagueDetailsList"
import { fmtPts } from "@pbd/lib/format"
import { buildLeagueTableRows, countGameweeksPlayed } from "@pbd/lib/fpl/leagueTableRows"
import type { LeagueTableMode } from "@pbd/lib/fpl/leagueTableRows"
import type { ManagerTableColumn, ManagerTableRow } from "@pbd/types/managerTable.types"
import type { JSX } from "react"
import { useMemo } from "react"

type Props = {
  leagueIds: number[]
  mode: LeagueTableMode
}

const EMPTY_MESSAGES: Record<LeagueTableMode, string> = {
  total: "The table fills in once the first gameweek kicks off.",
  form: "Scores appear once the gameweek kicks off.",
}

const AVERAGE_DECIMALS = 2

const POINTS_COLUMN: ManagerTableColumn = { key: "points", header: "Pts", className: "w-14" }

const AVERAGE_COLUMN: ManagerTableColumn = {
  key: "average",
  header: "Avg",
  emphasis: "muted",
  className: "w-14",
}

const TO_PLAY_COLUMN: ManagerTableColumn = {
  key: "toPlay",
  header: "To play",
  emphasis: "muted",
  className: "w-16",
}

const columnsFor = (mode: LeagueTableMode, anyToPlay: boolean): ManagerTableColumn[] => {
  if (mode === "total") return [AVERAGE_COLUMN, POINTS_COLUMN]
  if (anyToPlay) return [TO_PLAY_COLUMN, POINTS_COLUMN]
  return [POINTS_COLUMN]
}

export const LeagueTable = ({ leagueIds, mode }: Props): JSX.Element => {
  const leagues = useLeagueDetailsList(leagueIds)
  const { data: bootstrap } = useBootstrapStatic()
  const { data: toPlayMap } = useCurrentGwToPlay(leagueIds)
  const { data: returnsMap } = useCurrentGwGoalsAndAssists(leagueIds)
  const { data: pointsMap } = useCurrentGwPoints(leagueIds)

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

  const anyToPlay = rows.some((row) => row.toPlay > 0)

  const tableRows: ManagerTableRow[] = rows.map((row) => ({
    key: String(row.leagueEntryId),
    rank: row.rank,
    lastRank: row.lastRank,
    entryApiId: row.leagueEntryId,
    leagueId: row.leagueId,
    managerName: row.playerName,
    teamName: row.teamName,
    cells: {
      average: row.averagePoints.toFixed(AVERAGE_DECIMALS),
      toPlay: row.toPlay > 0 ? row.toPlay : null,
      points: fmtPts(mode === "total" ? row.total : row.gameweekScore),
    },
  }))

  return (
    <ManagerTable
      columns={columnsFor(mode, anyToPlay)}
      rows={tableRows}
      showFaces
      showRankArrows
      emptyTitle="No Standings Yet"
      emptyMessage={EMPTY_MESSAGES[mode]}
    />
  )
}
