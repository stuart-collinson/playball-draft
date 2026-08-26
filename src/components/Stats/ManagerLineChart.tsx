"use client"

import { type ChartConfig, ChartContainer } from "@pbd/components/ui/chart"
import { buildGameweekTicks, getGameweekAxisMax, shouldShowDots } from "@pbd/lib/fpl/chartAxis"
import type { JSX } from "react"
import { useMemo, useState } from "react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts"

export type ManagerLineSeries = {
  entryApiId: number
  managerName: string
  points: { event: number; value: number | null }[]
}

type Props = {
  series: ManagerLineSeries[]
  yAxisLabel: string
  reversed: boolean
  yDomain: [number, number]
  yTicks?: number[]
  goatEntryId?: number | null
  allowDecimals?: boolean
}

const LINE_COLORS = [
  "#f87171",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#22d3ee",
  "#60a5fa",
  "#c084fc",
  "#f472b6",
]

const AXIS_LABEL_STYLE = {
  fill: "oklch(58% 0.015 250)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
} as const

export const ManagerLineChart = ({
  series,
  yAxisLabel,
  reversed,
  yDomain,
  yTicks,
  goatEntryId = null,
  allowDecimals = false,
}: Props): JSX.Element => {
  const participants = useMemo(
    () =>
      series.map((s, i) => ({
        entryApiId: s.entryApiId,
        managerName: s.managerName,
        color: LINE_COLORS[i % LINE_COLORS.length] ?? "#94a3b8",
      })),
    [series],
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

  const chartData = useMemo(() => {
    const events = new Set<number>()
    for (const s of series) for (const p of s.points) events.add(p.event)
    const sortedEvents = Array.from(events).sort((a, b) => a - b)
    return sortedEvents.map((event) => {
      const row: Record<string, number | null> = { event }
      for (const s of series) {
        const pt = s.points.find((p) => p.event === event)
        row[String(s.entryApiId)] = pt ? pt.value : null
      }
      return row
    })
  }, [series])

  const showSolo = effectiveSelected.size === 1

  const latestEvent = chartData.length ? Math.max(...chartData.map((row) => Number(row.event))) : 0
  const axisMax = getGameweekAxisMax(latestEvent)
  const gameweekTicks = buildGameweekTicks(latestEvent)
  const showDots = showSolo || shouldShowDots(chartData.length)

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

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card p-3 pr-1 sm:p-4 sm:pr-2">
        <ChartContainer config={chartConfig} className="aspect-auto h-[320px] w-full sm:h-[380px]">
          <LineChart
            accessibilityLayer
            data={chartData}
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
                style: AXIS_LABEL_STYLE,
              }}
            />
            <YAxis
              reversed={reversed}
              type="number"
              domain={yDomain}
              {...(yTicks ? { ticks: yTicks, interval: 0 as const } : {})}
              tickLine={false}
              axisLine={false}
              width={56}
              tickMargin={4}
              tick={{ fontSize: 11, fontWeight: 600 }}
              allowDecimals={allowDecimals}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: "insideLeft",
                offset: 10,
                dy: 30,
                style: { ...AXIS_LABEL_STYLE, textAnchor: "middle" },
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
                            {p.entryApiId === goatEntryId ? " 🐐" : ""}
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
