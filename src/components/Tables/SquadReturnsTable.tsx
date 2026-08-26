"use client"

import { ManagerStatList } from "@pbd/components/Tables/ManagerStatList"
import type { ManagerStatRow } from "@pbd/components/Tables/ManagerStatList"
import { useSquadReturns } from "@pbd/hooks/fpl/useSquadReturns"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
  variant: "goals" | "assists"
}

const plural = (count: number, word: string): string =>
  `${count} ${count === 1 ? word : `${word}s`}`

export const SquadReturnsTable = ({ leagueIds, variant }: Props): JSX.Element => {
  const { data } = useSquadReturns({ leagueIds })

  const sorted = [...data].sort((a, b) =>
    variant === "goals"
      ? b.goals - a.goals || b.assists - a.assists
      : b.assists - a.assists || b.goals - a.goals,
  )

  const rows: ManagerStatRow[] = sorted.map((row, index) => ({
    rank: index + 1,
    entryApiId: row.entryApiId,
    leagueId: row.leagueId,
    managerName: row.managerName,
    teamName: row.teamName,
    primary:
      variant === "goals"
        ? { value: fmtPts(row.goals), label: "Goals" }
        : { value: fmtPts(row.assists), label: "Assists" },
    detail: variant === "goals" ? plural(row.assists, "assist") : plural(row.goals, "goal"),
  }))

  return (
    <ManagerStatList
      rows={rows}
      emptyTitle="No Gameweek Data Yet"
      emptyMessage="Goals and assists appear once the first gameweek is complete."
    />
  )
}
