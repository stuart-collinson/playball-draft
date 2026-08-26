"use client"

import { ManagerStatList } from "@pbd/components/Tables/ManagerStatList"
import type { ManagerStatRow } from "@pbd/components/Tables/ManagerStatList"
import { useSquadReturns } from "@pbd/hooks/fpl/useSquadReturns"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { JSX } from "react"

type SquadReturnsVariant = "goals" | "assists" | "clean-sheets" | "defcon"

type Props = {
  leagueIds: number[]
  variant: SquadReturnsVariant
}

type Row = {
  entryApiId: number
  leagueId: number
  managerName: string
  teamName: string
  goals: number
  assists: number
  cleanSheets: number
  defconPoints: number
  expectedGoals: number
  expectedAssists: number
}

const plural = (count: number, word: string): string =>
  `${count} ${count === 1 ? word : `${word}s`}`

const sortValue = (row: Row, variant: SquadReturnsVariant): number => {
  if (variant === "goals") return row.goals
  if (variant === "assists") return row.assists
  if (variant === "clean-sheets") return row.cleanSheets
  return row.defconPoints
}

const primaryOf = (row: Row, variant: SquadReturnsVariant): { value: string; label: string } => {
  if (variant === "goals") return { value: fmtPts(row.goals), label: "Goals" }
  if (variant === "assists") return { value: fmtPts(row.assists), label: "Assists" }
  if (variant === "clean-sheets") return { value: fmtPts(row.cleanSheets), label: "Clean Sheets" }
  return { value: fmtPts(row.defconPoints), label: "Defcon Pts" }
}

const detailOf = (row: Row, variant: SquadReturnsVariant): string => {
  if (variant === "goals") return `${row.expectedGoals} xG`
  if (variant === "assists") return `${row.expectedAssists} xA`
  if (variant === "clean-sheets") return `${row.defconPoints} defcon pts`
  return plural(row.cleanSheets, "clean sheet")
}

export const SquadReturnsTable = ({ leagueIds, variant }: Props): JSX.Element => {
  const { data } = useSquadReturns({ leagueIds })

  const rows: ManagerStatRow[] = [...data]
    .sort((a, b) => sortValue(b, variant) - sortValue(a, variant) || b.goals - a.goals)
    .map((row, index) => ({
      rank: index + 1,
      entryApiId: row.entryApiId,
      leagueId: row.leagueId,
      managerName: row.managerName,
      teamName: row.teamName,
      primary: primaryOf(row, variant),
      detail: detailOf(row, variant),
    }))

  return (
    <ManagerStatList
      rows={rows}
      emptyTitle="No Gameweek Data Yet"
      emptyMessage="This fills in once the first gameweek is complete."
    />
  )
}
