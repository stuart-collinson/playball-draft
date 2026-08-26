"use client"

import { PitchSurface } from "@pbd/components/Pitch/PitchSurface"
import type { PitchPlayer, PitchRow } from "@pbd/components/Pitch/PitchSurface"
import { useSquadViewData } from "@pbd/hooks/fpl/useSquadViewData"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"
import { fmtPts, fmtSigned, round1 } from "@pbd/lib/utils/fmt"
import type { FplElement } from "@pbd/types/fpl.types"
import type { PlayerDialogData } from "@pbd/types/player.types"
import type { JSX } from "react"
import { useMemo } from "react"

type Props = {
  player: PlayerDialogData
}

const POSITION_ROW_ORDER = [1, 2, 3, 4] as const

const AVAILABLE_STATUS = "a"
const DOUBTFUL_STATUS = "d"
const AMBER_CHANCE_MIN = 50

const availabilityFlag = (element: FplElement | undefined): "amber" | "red" | undefined => {
  if (!element || element.status === AVAILABLE_STATUS) return undefined
  if (
    element.status === DOUBTFUL_STATUS &&
    (element.chance_of_playing_next_round ?? 0) >= AMBER_CHANCE_MIN
  )
    return "amber"
  return "red"
}

const SquadView = ({ player }: Props): JSX.Element => {
  const entryId = PARTICIPANT_BY_API_ID[player.apiId]?.entryId ?? 0

  const {
    bootstrap: { data: bootstrap },
    picks: { data: picksData, isLoading: picksLoading },
    live: { data: liveData },
  } = useSquadViewData(entryId)

  const elementMap = useMemo(
    () => (bootstrap ? new Map(bootstrap.elements.map((e) => [e.id, e])) : new Map()),
    [bootstrap],
  )

  const starters = useMemo(
    () =>
      (picksData?.picks ?? [])
        .filter((p) => p.position <= 11)
        .sort((a, b) => a.position - b.position),
    [picksData],
  )

  const bench = useMemo(
    () =>
      (picksData?.picks ?? [])
        .filter((p) => p.position > 11)
        .sort((a, b) => a.position - b.position),
    [picksData],
  )

  const startersByPosition = useMemo(() => {
    const grouped = new Map<number, typeof starters>([
      [1, []],
      [2, []],
      [3, []],
      [4, []],
    ])
    for (const pick of starters) {
      const el = elementMap.get(pick.element)
      if (!el) continue
      grouped.get(el.element_type)?.push(pick)
    }
    return grouped
  }, [starters, elementMap])

  const getPointsDisplay = (elementId: number): string => {
    const element = liveData?.elements[String(elementId)]
    if (!element) return "0"
    if (element.explain && element.explain.length > 1) {
      return element.explain
        .map((entry) => (entry[0] ?? []).reduce((sum, s) => sum + s.points, 0))
        .join(", ")
    }
    return String(element.stats.total_points)
  }

  if (!picksData || !bootstrap || picksLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Loading squad...
      </div>
    )
  }

  const rows: PitchRow[] = POSITION_ROW_ORDER.flatMap((posType) => {
    const players = startersByPosition.get(posType) ?? []
    if (!players.length) return []
    return [
      {
        key: String(posType),
        players: players.map((pick) => ({
          key: String(pick.element),
          name: elementMap.get(pick.element)?.web_name ?? "?",
          value: getPointsDisplay(pick.element),
          flag: availabilityFlag(elementMap.get(pick.element)),
        })),
      },
    ]
  })

  let outfieldCount = 0
  const benchPlayers: PitchPlayer[] = bench.map((pick) => {
    const el = elementMap.get(pick.element)
    const isGk = el?.element_type === 1
    return {
      key: String(pick.element),
      name: el?.web_name ?? "?",
      value: getPointsDisplay(pick.element),
      flag: availabilityFlag(el),
      label: isGk ? "GK" : String(++outfieldCount),
    }
  })

  const squad = (picksData.picks ?? [])
    .map((pick) => elementMap.get(pick.element))
    .filter((element): element is FplElement => element !== undefined)
  const squadPoints = squad.reduce((sum, element) => sum + element.total_points, 0)
  const actualInvolvements = squad.reduce(
    (sum, element) => sum + element.goals_scored + element.assists,
    0,
  )
  const expectedInvolvements = squad.reduce(
    (sum, element) => sum + Number.parseFloat(element.expected_goal_involvements),
    0,
  )
  const xgiDelta = round1(actualInvolvements - expectedInvolvements)
  const flaggedCount = squad.filter((element) => availabilityFlag(element) !== undefined).length

  const seasonCells = [
    { label: "Squad Pts", value: fmtPts(squadPoints) },
    { label: "G+A", value: fmtPts(actualInvolvements) },
    { label: "xGI Δ", value: fmtSigned(xgiDelta) },
    { label: "Flagged", value: String(flaggedCount) },
  ]

  return (
    <div className="flex flex-col gap-2">
      <PitchSurface rows={rows} bench={benchPlayers} />
      <div className="grid grid-cols-4 gap-1">
        {seasonCells.map((cell) => (
          <div
            key={cell.label}
            className="flex flex-col items-center rounded-lg border border-border bg-muted/30 px-1 py-1.5"
          >
            <p className="text-sm font-black tabular-nums text-foreground">{cell.value}</p>
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{cell.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SquadView
