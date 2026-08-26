"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { RankBadge } from "@pbd/components/LeagueTable/RankBadge"
import { ManagerStatList } from "@pbd/components/Tables/ManagerStatList"
import type { ManagerStatRow } from "@pbd/components/Tables/ManagerStatList"
import { useDraftBoard } from "@pbd/hooks/fpl/useDraftBoard"
import { STAT_TABLE_ROW_LIMIT } from "@pbd/lib/constants/Stats"
import { LEAGUE_IDS, LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import {
  computeDraftGrades,
  computeDraftValue,
  computeReachRows,
  computeRoundWinners,
} from "@pbd/lib/fpl/draftValue"
import { fmtPts, fmtSigned } from "@pbd/lib/utils/fmt"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
  variant: "grades" | "steals" | "busts" | "rounds" | "reach"
}

type PlayerRow = {
  key: string
  rank: number
  playerName: string
  meta: string
  value: string
  valueLabel: string
}

const leagueLabelFor = (leagueId: number): string =>
  leagueId === LEAGUE_IDS.PREMIERSHIP ? LEAGUE_LABELS.premiership : LEAGUE_LABELS.championship

export const DraftBoardView = ({ leagueIds, variant }: Props): JSX.Element => {
  const { data } = useDraftBoard({ leagueIds })
  const picks = data.picks

  if (picks.length === 0)
    return (
      <EmptyState title="No Draft Data" message="Draft picks appear once the draft is complete." />
    )

  if (variant === "grades") {
    const nameByElement = new Map(picks.map((pick) => [pick.elementId, pick.playerName]))
    const teamByEntry = new Map(picks.map((pick) => [pick.entryApiId, pick.teamName]))
    const managerByEntry = new Map(picks.map((pick) => [pick.entryApiId, pick.managerName]))
    const rows: ManagerStatRow[] = [...computeDraftGrades(picks)]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((grade, index) => ({
        rank: index + 1,
        entryApiId: grade.entryApiId,
        leagueId: grade.leagueId,
        managerName: managerByEntry.get(grade.entryApiId) ?? `Entry ${grade.entryApiId}`,
        teamName: teamByEntry.get(grade.entryApiId) ?? "",
        primary: { value: fmtPts(grade.totalPoints), label: "Draft Pts" },
        detail: `avg ${grade.avgPoints} · best ${
          grade.bestPickElementId === null
            ? "—"
            : (nameByElement.get(grade.bestPickElementId) ?? "—")
        }`,
      }))
    return (
      <ManagerStatList
        rows={rows}
        emptyTitle="No Draft Data"
        emptyMessage="Draft picks appear once the draft is complete."
      />
    )
  }

  if (variant === "rounds") {
    const winners = computeRoundWinners(picks)
    const showLeague = leagueIds.length > 1
    return (
      <div className="flex flex-col gap-2">
        {winners.map((winner) => (
          <div
            key={`${winner.leagueId}-${winner.round}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <span className="flex w-10 shrink-0 items-center justify-center text-sm font-black tabular-nums text-muted-foreground">
              R{winner.round}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">
                {winner.pick.playerName}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {winner.pick.playerTeam}
                </span>
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {winner.pick.managerName} · Pick {winner.pick.pickNumber}
                {showLeague && ` · ${leagueLabelFor(winner.leagueId)}`}
              </p>
            </div>
            <div className="w-14 shrink-0 text-right">
              <p className="text-base font-black tabular-nums text-foreground">
                {fmtPts(winner.pick.seasonPoints)}
              </p>
              <p className="text-[10px] text-muted-foreground/60">Pts</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const rows: PlayerRow[] =
    variant === "reach"
      ? computeReachRows(picks)
          .slice(0, STAT_TABLE_ROW_LIMIT)
          .map((row, index) => ({
            key: `${row.leagueId}-${row.elementId}`,
            rank: index + 1,
            playerName: `${row.playerName} (${row.playerTeam})`,
            meta: `${row.managerName} · Pick ${row.pickNumber} · ADP ${row.draftRank}`,
            value: fmtSigned(row.reachDelta),
            valueLabel: "Reach",
          }))
      : [...computeDraftValue(picks)]
          .sort((a, b) =>
            variant === "steals" ? b.valueScore - a.valueScore : a.valueScore - b.valueScore,
          )
          .slice(0, STAT_TABLE_ROW_LIMIT)
          .map((row, index) => ({
            key: `${row.leagueId}-${row.elementId}`,
            rank: index + 1,
            playerName: `${row.playerName} (${row.playerTeam})`,
            meta: `${row.managerName} · R${row.round} P${row.pickNumber} · ${fmtPts(row.seasonPoints)} pts`,
            value: fmtSigned(row.valueScore),
            valueLabel: "Value",
          }))

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
        >
          <RankBadge rank={row.rank} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{row.playerName}</p>
            <p className="truncate text-xs text-muted-foreground">{row.meta}</p>
          </div>
          <div className="w-14 shrink-0 text-right">
            <p className="text-base font-black tabular-nums text-foreground">{row.value}</p>
            <p className="text-[10px] text-muted-foreground/60">{row.valueLabel}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
