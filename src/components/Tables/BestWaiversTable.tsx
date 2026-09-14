"use client"

import { AcquisitionList } from "@pbd/components/Tables/AcquisitionList"
import { useBestWaivers } from "@pbd/hooks/fpl/useBestWaivers"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
  sortBy: "total" | "avg"
  direction?: "best" | "worst"
  minGws?: number
  maxGws?: number
  limit?: number
}

export const BestWaiversTable = ({
  leagueIds,
  sortBy,
  direction,
  minGws,
  maxGws,
  limit,
}: Props): JSX.Element => {
  const { data } = useBestWaivers({ leagueIds, sortBy, direction, minGws, maxGws, limit })

  return (
    <AcquisitionList
      rows={data}
      sortBy={sortBy}
      emptyTitle="No Waivers Yet"
      emptyMessage="Waiver signings appear once the season is under way."
    />
  )
}
