"use client"

import { PitchSurface } from "@pbd/components/Pitch/PitchSurface"
import type { PitchPlayer, PitchRow } from "@pbd/components/Pitch/PitchSurface"
import { useSquadViewData } from "@pbd/hooks/fpl/useSquadViewData"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"
import type { PlayerDialogData } from "@pbd/types/player.types"
import type { JSX } from "react"
import { useMemo } from "react"

type Props = {
  player: PlayerDialogData
}

const POSITION_ROW_ORDER = [1, 2, 3, 4] as const

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
      label: isGk ? "GK" : String(++outfieldCount),
    }
  })

  return <PitchSurface rows={rows} bench={benchPlayers} />
}

export default SquadView
