"use client"

import { type ChartConfig, ChartContainer } from "@pbd/components/ui/chart"
import { usePositionHistory } from "@pbd/hooks/fpl/usePositionHistory"
import { buildGameweekTicks, getGameweekAxisMax, shouldShowDots } from "@pbd/lib/fpl/chartAxis"
import type { JSX } from "react"
import { useMemo, useState } from "react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts"

type Props = {
  leagueId: number
}

// High-contrast palette for the chart lines only — hues spread across the
// wheel so 8 participants are always visually distinct on a dark background.
const LINE_COLORS = [
  "#f87171", // red
  "#fb923c", // orange
  "#facc15", // yellow
  "#4ade80", // green
  "#22d3ee", // cyan
  "#60a5fa", // blue
  "#c084fc", // purple
  "#f472b6", // pink
]

// A league is smaller than the palette, so the y-axis follows the number of
// participants rather than assuming one league's worth.
const MIN_POSITION_RANGE = 2

export const PositionHistoryChart = ({ leagueId }: Props): JSX.Element => {
  const { data } = usePositionHistory({ leagueIds: [leagueId] })

  const participants = useMemo(
    () =>
      data.map((d, i) => ({
        entryApiId: d.entryApiId,
        managerName: d.managerName,
        color: LINE_COLORS[i % LINE_COLORS.length] ?? "#94a3b8",
      })),
    [data],
  )

  const [selectedIds, setSelectedIds] = useState<Set<number> | null>(null)
  const effectiveSelected = selectedIds ?? new Set(participants.map((p) => p.entryApiId))

  const toggleParticipant = (id: number): void => {
    setSelectedIds((prev) => {
      const base = prev ?? new Set(participants.map((p) => p.entryApiId))
      const next = new Set(base)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const chartConfig = useMemo<ChartConfig>(() => {
    const cfg: ChartConfig = {}
    for (const p of participants) {
      cfg[String(p.entryApiId)] = { label: p.managerName, color: p.color }
    }
    return cfg
  }, [participants])

  // Recharts data shape: one row per GW with a key per participant
  const chartData = useMemo(() => {
    const events = new Set<number>()
    for (const d of data) for (const h of d.history) events.add(h.event)
    const sortedEvents = Array.from(events).sort((a, b) => a - b)
    return sortedEvents.map((event) => {
      const row: Record<string, number | null> = { event }
      for (const d of data) {
        const pt = d.history.find((h) => h.event === event)
        row[String(d.entryApiId)] = pt && pt.position > 0 ? pt.position : null
      }
      return row
    })
  }, [data])

  const showSolo = effectiveSelected.size === 1

  // The axis follows the gameweeks actually played, so the chart fills its
  // canvas from gameweek one and rescales itself as the season goes on.
  const latestEvent = chartData.length ? Math.max(...chartData.map((row) => Number(row.event))) : 0
  const axisMax = getGameweekAxisMax(latestEvent)
  const gameweekTicks = buildGameweekTicks(latestEvent)
  const showDots = showSolo || shouldShowDots(chartData.length)

  const positionMax = Math.max(participants.length, MIN_POSITION_RANGE)
  const positionTicks = Array.from({ length: positionMax }, (_, index) => index + 1)

  // For each participant, find the index of their last non-null position
  // so we can render a name label at the rightmost plotted point.
  const lastIndexByParticipant = useMemo(() => {
    const map = new Map<number, number>()
    for (const p of participants) {
      const key = String(p.entryApiId)
      let lastIdx = -1
      for (let i = 0; i < chartData.length; i++) {
        if (chartData[i]?.[key] != null) lastIdx = i
      }
      map.set(p.entryApiId, lastIdx)
    }
    return map
  }, [participants, chartData])

  // The leader: participant currently sitting at position 1 at the latest
  // gameweek where any data exists.
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

  // Positions only exist for completed gameweeks, so before the first one
  // finishes there is nothing to plot — an empty axis grid reads as broken.
  if (chartData.length === 0)
    return (
      <div className="flex h-[320px] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-6 text-center sm:h-[380px]">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
          No Gameweeks Played
        </p>
        <p className="text-xs text-muted-foreground">
          Positions start plotting once Gameweek 1 is complete.
        </p>
      </div>
    )

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card p-3 pr-1 sm:p-4 sm:pr-2">
        <ChartContainer config={chartConfig} className="aspect-auto h-[320px] w-full sm:h-[380px]">
          <LineChart
            accessibilityLayer
            data={chartData}
            // The latest point now sits on the right edge of the plot area at
            // every gameweek, so the manager labels drawn beyond it need the
            // whole margin — the longest nickname plus the leader's goat.
            margin={{ top: 12, right: 96, bottom: 4, left: -4 }}
          >
            <CartesianGrid vertical={false} stroke="oklch(28% 0.022 250)" strokeDasharray="3 4" />
            <XAxis
              dataKey="event"
              type="number"
              domain={[1, axisMax]}
              ticks={gameweekTicks}
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              interval={0}
              height={48}
              tick={{ fontSize: 11, fontWeight: 600 }}
              label={{
                value: "Gameweek",
                position: "insideBottom",
                offset: 4,
                style: {
                  fill: "oklch(58% 0.015 250)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                },
              }}
            />
            <YAxis
              reversed
              type="number"
              domain={[1, positionMax]}
              ticks={positionTicks}
              tickLine={false}
              axisLine={false}
              width={56}
              interval={0}
              tickMargin={4}
              tick={{ fontSize: 11, fontWeight: 600 }}
              allowDecimals={false}
              label={{
                value: "Position",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                dy: 30,
                style: {
                  fill: "oklch(58% 0.015 250)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  textAnchor: "middle",
                },
              }}
            />
            {participants.map((p) => {
              const visible = effectiveSelected.has(p.entryApiId)
              if (!visible) return null
              const lastIdx = lastIndexByParticipant.get(p.entryApiId) ?? -1
              return (
                <Line
                  key={p.entryApiId}
                  type="monotone"
                  dataKey={String(p.entryApiId)}
                  stroke={p.color}
                  strokeWidth={showSolo ? 3 : 2}
                  dot={showDots ? { r: 3.5, fill: p.color, strokeWidth: 0 } : false}
                  activeDot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey={String(p.entryApiId)}
                    content={(props) => {
                      const { x, y, index, value } = props as {
                        x?: number | string
                        y?: number | string
                        index?: number
                        value?: number | string | null
                      }
                      if (value == null) return null
                      if (index !== lastIdx) return null
                      const xNum = typeof x === "number" ? x : Number(x)
                      const yNum = typeof y === "number" ? y : Number(y)
                      if (Number.isNaN(xNum) || Number.isNaN(yNum)) return null
                      return (
                        <g>
                          <circle
                            cx={xNum}
                            cy={yNum}
                            r={3}
                            fill={p.color}
                            stroke="oklch(13% 0.015 250)"
                            strokeWidth={1.5}
                          />
                          <text
                            x={xNum + 8}
                            y={yNum + 3.5}
                            fill={p.color}
                            fontSize={11}
                            fontWeight={700}
                            style={{ pointerEvents: "none" }}
                          >
                            {p.managerName}
                            {p.entryApiId === leaderId ? " 🐐" : ""}
                          </text>
                        </g>
                      )
                    }}
                  />
                </Line>
              )
            })}
          </LineChart>
        </ChartContainer>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Participants
        </p>
        <div className="flex flex-wrap gap-1.5">
          {participants.map((p) => {
            const active = effectiveSelected.has(p.entryApiId)
            return (
              <button
                key={p.entryApiId}
                type="button"
                onClick={() => toggleParticipant(p.entryApiId)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all ${
                  active
                    ? "border-border bg-card text-foreground"
                    : "border-border/40 bg-card/40 text-muted-foreground/60"
                }`}
              >
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: p.color,
                    opacity: active ? 1 : 0.3,
                  }}
                />
                {p.managerName}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
