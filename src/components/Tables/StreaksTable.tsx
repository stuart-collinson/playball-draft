"use client"

import { ManagerStatList } from "@pbd/components/Tables/ManagerStatList"
import type { ManagerStatRow } from "@pbd/components/Tables/ManagerStatList"
import { useStreaksTable } from "@pbd/hooks/fpl/useStreaksTable"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

const streakSortValue = (current: { type: string; length: number }): number => {
  if (current.type === "hot") return current.length
  if (current.type === "cold") return -current.length
  return 0
}

const streakDisplay = (current: { type: string; length: number }): string => {
  if (current.type === "hot") return `+${current.length}`
  if (current.type === "cold") return `-${current.length}`
  return "0"
}

export const StreaksTable = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useStreaksTable({ leagueIds })

  const rows: ManagerStatRow[] = [...data]
    .sort((a, b) => streakSortValue(b.current) - streakSortValue(a.current))
    .map((row, index) => ({
      rank: index + 1,
      entryApiId: row.entryApiId,
      leagueId: row.leagueId,
      managerName: row.managerName,
      teamName: row.teamName,
      primary: { value: streakDisplay(row.current), label: "Streak" },
      detail: `Hot ${row.longestHot} · Cold ${row.longestCold}`,
    }))

  return (
    <ManagerStatList
      rows={rows}
      emptyTitle="No Gameweek Data Yet"
      emptyMessage="Streaks appear once the first gameweek is complete."
    />
  )
}
