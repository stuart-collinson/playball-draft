"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import type { JSX } from "react"
import { useMemo } from "react"
import { PICKS_DISPLAY_COUNT, POSITION_LABELS } from "@pbd/lib/constants/fpl"
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

  const teamMap = useMemo(
    () => new Map(bootstrap.teams.map((t) => [t.id, t.short_name])),
    [bootstrap.teams],
  )

  const picks = useMemo(
    () =>
      choicesData.choices
        .slice()
        .sort((a, b) => a.round - b.round || a.pick - b.pick)
        .slice(0, PICKS_DISPLAY_COUNT),
    [choicesData.choices],
  )

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {picks.map((choice, index) => {
        const overallPick = index + 1
        const player = elementMap.get(choice.element)
        const position = player ? (POSITION_LABELS[player.element_type] ?? "") : ""
        const club = player ? (teamMap.get(player.team) ?? "") : ""
        const managerFirst = choice.player_first_name

        return (
          <div key={choice.id} className="relative pt-4">
            {/* Pick number */}
            <div className="absolute left-1/2 top-0 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-border bg-card">
              <span className="text-[10px] font-black text-muted-foreground">{overallPick}</span>
            </div>

            {/* Card body */}
            <div className="flex h-full flex-col rounded-xl border border-border bg-card px-2.5 pb-3 pt-6 text-center">
              {/* Player name — dominant */}
              <p className="text-sm font-bold leading-snug text-foreground">
                {player?.web_name ?? `#${choice.element}`}
              </p>

              {/* Club · Position */}
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {club}
                {club && position ? " · " : ""}
                {position}
              </p>

              <div className="my-2 h-px bg-border" />

              {/* Manager */}
              <p className="text-[11px] font-medium text-muted-foreground leading-tight">
                {managerFirst}
                {choice.was_auto && (
                  <span className="ml-1 text-[9px] opacity-50">auto</span>
                )}
              </p>

              {/* Round */}
              <p className="mt-0.5 text-[10px] text-muted-foreground/60">Rd {choice.round}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
