"use client"

import { ManagerStatList } from "@pbd/components/Tables/ManagerStatList"
import type { ManagerStatRow } from "@pbd/components/Tables/ManagerStatList"
import { useRoundRobinTable } from "@pbd/hooks/fpl/useRoundRobinTable"
import { fmtSigned } from "@pbd/lib/utils/fmt"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
  variant: "round-robin" | "luck"
}

export const RoundRobinTable = ({ leagueIds, variant }: Props): JSX.Element => {
  const { data } = useRoundRobinTable({ leagueIds })

  const sorted = [...data].sort((a, b) =>
    variant === "luck"
      ? b.luckDelta - a.luckDelta || b.winPct - a.winPct
      : b.winPct - a.winPct || b.totalPoints - a.totalPoints,
  )

  const rows: ManagerStatRow[] = sorted.map((row, index) => ({
    rank: index + 1,
    entryApiId: row.entryApiId,
    leagueId: row.leagueId,
    managerName: row.managerName,
    teamName: row.teamName,
    primary:
      variant === "luck"
        ? { value: fmtSigned(row.luckDelta), label: "Luck" }
        : { value: `${row.winPct}%`, label: "Win %" },
    detail:
      variant === "luck"
        ? `Table ${row.actualRank} · Round robin ${row.roundRobinRank}`
        : `W ${row.wins} · D ${row.draws} · L ${row.losses}`,
  }))

  return (
    <ManagerStatList
      rows={rows}
      emptyTitle="No Gameweek Data Yet"
      emptyMessage="This fills in once the first gameweek is complete."
    />
  )
}
