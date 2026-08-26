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

const MIN_GAP_RANGE = 5

export const PointsRaceChart = ({ leagueId }: Props): JSX.Element => {
  const { data } = usePositionHistory({ leagueIds: [leagueId] })

  const { series, domainMin, leaderId } = useMemo(() => {
    const events = [...new Set(data.flatMap((d) => d.history.map((h) => h.event)))].sort(
      (a, b) => a - b,
    )
    const leaderTotals = new Map<number, number>()
    for (const event of events) {
      const totals = data.map((d) => d.history.find((h) => h.event === event)?.totalPoints ?? 0)
      leaderTotals.set(event, Math.max(...totals, 0))
    }
    const built: ManagerLineSeries[] = data.map((d) => ({
      entryApiId: d.entryApiId,
      managerName: d.managerName,
      points: events.map((event) => {
        const point = d.history.find((h) => h.event === event)
        const leader = leaderTotals.get(event) ?? 0
        return { event, value: point ? point.totalPoints - leader : null }
      }),
    }))
    const gaps = built.flatMap((s) => s.points.map((p) => p.value ?? 0))
    const lastEvent = events[events.length - 1]
    const leader =
      lastEvent === undefined
        ? null
        : (data.find(
            (d) =>
              (d.history.find((h) => h.event === lastEvent)?.totalPoints ?? -1) ===
              leaderTotals.get(lastEvent),
          )?.entryApiId ?? null)
    return {
      series: built,
      domainMin: Math.min(...gaps, -MIN_GAP_RANGE),
      leaderId: leader,
    }
  }, [data])

  if (series.length === 0 || series.every((s) => s.points.length === 0))
    return (
      <EmptyState
        title="No Gameweeks Played"
        message="The points race starts plotting once Gameweek 1 is complete."
      />
    )

  return (
    <ManagerLineChart
      series={series}
      yAxisLabel="Points off lead"
      reversed={false}
      yDomain={[domainMin, 0]}
      goatEntryId={leaderId}
    />
  )
}
