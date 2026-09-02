"use client"

import { PitchSurface } from "@pbd/components/Pitch/PitchSurface"
import { useSquadViewData } from "@pbd/hooks/fpl/useSquadViewData"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"
import { availabilityFlag, buildStarterRows } from "@pbd/lib/fpl/lineup"
import { fmtPts, round1 } from "@pbd/lib/utils/fmt"
import type { FplElement } from "@pbd/types/fpl.types"
import type { PitchPlayer } from "@pbd/types/pitch.types"
import type { PlayerDialogData } from "@pbd/types/player.types"
import type { JSX } from "react"
import { useMemo } from "react"

type Props = {
  player: PlayerDialogData
}

const SquadView = ({ player }: Props): JSX.Element => {
  const entryId = PARTICIPANT_BY_API_ID[player.apiId]?.entryId ?? 0

  const {
    bootstrap: { data: bootstrap },
    picks: { data: picksData, isLoading: picksLoading },
    live: { data: liveData },
  } = useSquadViewData(entryId)

  const elementMap = useMemo(
    () =>
      bootstrap
        ? new Map<number, FplElement>(bootstrap.elements.map((e) => [e.id, e]))
        : new Map<number, FplElement>(),
    [bootstrap],
  )

  const clubByTeamId = useMemo(
    () =>
      new Map<number, string>((bootstrap?.teams ?? []).map((team) => [team.id, team.short_name])),
    [bootstrap],
  )

  const bench = useMemo(
    () =>
      (picksData?.picks ?? [])
        .filter((p) => p.position > 11)
        .sort((a, b) => a.position - b.position),
    [picksData],
  )

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

  const rows = buildStarterRows(
    picksData.picks,
    bootstrap.elements,
    bootstrap.teams,
    getPointsDisplay,
  )

  let outfieldCount = 0
  const benchPlayers: PitchPlayer[] = bench.map((pick) => {
    const el = elementMap.get(pick.element)
    const isGk = el?.element_type === 1
    return {
      key: String(pick.element),
      name: el?.web_name ?? "?",
      club: el ? clubByTeamId.get(el.team) : undefined,
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
    (sum, element) => sum + (Number.parseFloat(element.expected_goal_involvements) || 0),
    0,
  )
  const flaggedCount = squad.filter((element) => availabilityFlag(element) !== undefined).length

  const seasonCells = [
    { label: "Squad Pts", value: fmtPts(squadPoints) },
    { label: "xGA", value: String(round1(expectedInvolvements)) },
    { label: "G+A", value: fmtPts(actualInvolvements) },
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
