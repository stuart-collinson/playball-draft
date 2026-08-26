"use client"

import { ManagerStatList } from "@pbd/components/Tables/ManagerStatList"
import type { ManagerStatRow } from "@pbd/components/Tables/ManagerStatList"
import { useTreatmentTable } from "@pbd/hooks/fpl/useTreatmentTable"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

const STATUS_LABELS: Record<string, string> = {
  d: "doubt",
  i: "inj",
  s: "susp",
  u: "out",
  n: "na",
}

const flagLabel = (flag: { webName: string; status: string; chance: number | null }): string =>
  `${flag.webName} ${flag.chance !== null ? `${flag.chance}%` : (STATUS_LABELS[flag.status] ?? flag.status)}`

export const TreatmentTable = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useTreatmentTable({ leagueIds })

  const rows: ManagerStatRow[] = [...data]
    .sort((a, b) => b.flaggedCount - a.flaggedCount)
    .map((row, index) => ({
      rank: index + 1,
      entryApiId: row.entryApiId,
      leagueId: row.leagueId,
      managerName: row.managerName,
      teamName: row.teamName,
      primary: { value: `${row.flaggedCount}`, label: "Flagged" },
      detail: row.flaggedCount === 0 ? "fully fit" : row.worstFlags.map(flagLabel).join(" · "),
    }))

  return (
    <ManagerStatList
      rows={rows}
      emptyTitle="No Squad Data"
      emptyMessage="The treatment table appears once squads are drafted."
    />
  )
}
