"use client"

import { AcquisitionList } from "@pbd/components/Tables/AcquisitionList"
import { useBestTrades } from "@pbd/hooks/fpl/useBestTrades"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
  sortBy?: "total" | "avg"
  minGws?: number
  limit?: number
}

export const BestTradesTable = ({
  leagueIds,
  sortBy = "total",
  minGws,
  limit,
}: Props): JSX.Element => {
  const { data } = useBestTrades({ leagueIds, sortBy, minGws, limit })

  return (
    <AcquisitionList
      rows={data}
      sortBy={sortBy}
      emptyTitle="No Trades Yet"
      emptyMessage="Trades appear once managers start dealing."
    />
  )
}
