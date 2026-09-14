"use client"

import { ManagerStatList } from "@pbd/components/Tables/ManagerStatList"
import type { ManagerStatRow } from "@pbd/components/Tables/ManagerStatList"
import { useGwCountsTable } from "@pbd/hooks/fpl/useGwCountsTable"
import type { JSX } from "react"

type CountType = "relevancy" | "gw-wins" | "gw-losses"

type Props = {
  leagueIds: number[]
  type: CountType
}

const VALUE_LABEL: Record<CountType, string> = {
  relevancy: "Total",
  "gw-wins": "Wins",
  "gw-losses": "Losses",
}

const countFor = (entry: { gwWins: number; gwLosses: number }, type: CountType): number => {
  if (type === "gw-wins") return entry.gwWins
  if (type === "gw-losses") return entry.gwLosses
  return entry.gwWins + entry.gwLosses
}

export const GwCountsTable = ({ leagueIds, type }: Props): JSX.Element => {
  const { data } = useGwCountsTable({ leagueIds, type })

  const rows: ManagerStatRow[] = data.map((entry) => ({
    rank: entry.rank,
    entryApiId: entry.entryApiId,
    leagueId: entry.leagueId,
    managerName: entry.managerName,
    teamName: entry.teamName,
    primary: { value: String(countFor(entry, type)), label: VALUE_LABEL[type] },
  }))

  return (
    <ManagerStatList
      rows={rows}
      emptyTitle="No Gameweek Data Yet"
      emptyMessage="This fills in once the first gameweek is complete."
    />
  )
}
