"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { ManagerLineChart } from "@pbd/components/Stats/ManagerLineChart"
import type { ManagerLineSeries } from "@pbd/components/Stats/ManagerLineChart"
import { usePositionHistory } from "@pbd/hooks/fpl/usePositionHistory"
import type { JSX } from "react"
import { useMemo } from "react"

type Props = {
  leagueId: number
}

const MIN_POSITION_RANGE = 2

export const PositionHistoryChart = ({ leagueId }: Props): JSX.Element => {
  const { data } = usePositionHistory({ leagueIds: [leagueId] })

  const series = useMemo<ManagerLineSeries[]>(
    () =>
      data.map((d) => ({
        entryApiId: d.entryApiId,
        managerName: d.managerName,
        points: d.history.map((h) => ({
          event: h.event,
          value: h.position > 0 ? h.position : null,
        })),
      })),
    [data],
  )

  const leaderId = useMemo(() => {
    let latest = -1
    let leader: number | null = null
    for (const d of data) {
      for (const h of d.history) {
        if (h.position === 1 && h.event > latest) {
          latest = h.event
          leader = d.entryApiId
        }
      }
    }
    return leader
  }, [data])

  const hasEvents = series.some((s) => s.points.length > 0)
  if (!hasEvents)
    return (
      <EmptyState
        title="No Gameweeks Played"
        message="Positions start plotting once Gameweek 1 is complete."
      />
    )

  const positionMax = Math.max(series.length, MIN_POSITION_RANGE)
  const positionTicks = Array.from({ length: positionMax }, (_, index) => index + 1)

  return (
    <ManagerLineChart
      series={series}
      yAxisLabel="Position"
      reversed
      yDomain={[1, positionMax]}
      yTicks={positionTicks}
      goatEntryId={leaderId}
    />
  )
}
