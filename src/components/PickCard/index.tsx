"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import type { JSX } from "react"
import { useMemo } from "react"
import { Card } from "@pbd/components/ui/card"
import { PICKS_DISPLAY_COUNT } from "@pbd/lib/constants/fpl"
import type { FplElement } from "@pbd/types/fpl.types"
import { useTRPC } from "@pbd/trpc/react"

type PicksGridProps = {
  leagueId: number
}

export const PicksGrid = ({ leagueId }: PicksGridProps): JSX.Element => {
  const trpc = useTRPC()

  const { data: choicesData } = useSuspenseQuery(
    trpc.fpl.draftChoices.queryOptions({ leagueId }),
  )
  const { data: bootstrap } = useSuspenseQuery(trpc.fpl.bootstrapStatic.queryOptions())

  const elementMap = useMemo(
    () => new Map<number, FplElement>(bootstrap.elements.map((e) => [e.id, e])),
    [bootstrap.elements],
  )

  const picks = useMemo(
    () =>
      choicesData.choices
        .slice()
        .sort((a, b) => a.pick - b.pick)
        .slice(0, PICKS_DISPLAY_COUNT),
    [choicesData.choices],
  )

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {picks.map((choice) => {
        const player = elementMap.get(choice.element)
        const managerName = `${choice.player_first_name} ${choice.player_last_name}`

        return (
          <Card key={choice.id} className="gap-1 p-4">
            <p className="text-xs font-medium text-muted-foreground">Pick #{choice.pick}</p>
            <p className="text-sm font-semibold text-foreground">
              {player?.web_name ?? `Player ${choice.element}`}
            </p>
            <p className="text-xs text-muted-foreground">{managerName}</p>
          </Card>
        )
      })}
    </div>
  )
}
