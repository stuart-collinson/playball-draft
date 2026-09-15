"use client"

import { ForfeitsFilterSheet } from "@pbd/components/Forfeits/ForfeitsFilterSheet"
import { Badge } from "@pbd/components/ui/badge"
import { Button } from "@pbd/components/ui/button"
import { useForfeitFilterActions } from "@pbd/hooks/forfeits/useForfeitFilterActions"
import { useForfeitFilters } from "@pbd/hooks/forfeits/useForfeitFilters"
import { forfeitsHref } from "@pbd/lib/constants/Pages"
import { forfeitDisplayLabel } from "@pbd/lib/forfeits/selection"
import { COMBINED_SCOPE, getLeagueLabel } from "@pbd/lib/leagues"
import type { LeagueScope } from "@pbd/lib/leagues"
import { participantLabelForSlug } from "@pbd/lib/people"
import { SlidersHorizontal, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import type { JSX } from "react"
import { useState } from "react"

type Props = {
  scope: LeagueScope
  leagueSelectable?: boolean
}

type ActiveFilter = {
  key: string
  label: string
  onRemove: () => void
}

export const ForfeitsFilterBar = ({ scope, leagueSelectable = false }: Props): JSX.Element => {
  const router = useRouter()
  const query = useSearchParams().toString()
  const { cadence, gameweek, type, subType, person } = useForfeitFilters()
  const { selectCadence, selectForfeit, selectGameweek, selectPerson } = useForfeitFilterActions()
  const [isSheetOpen, setSheetOpen] = useState(false)

  const showCombined = (): void =>
    router.push(query ? `${forfeitsHref(COMBINED_SCOPE)}?${query}` : forfeitsHref(COMBINED_SCOPE))

  const active: ActiveFilter[] = [
    ...(leagueSelectable && scope !== COMBINED_SCOPE
      ? [{ key: "league", label: getLeagueLabel(scope), onRemove: showCombined }]
      : []),
    ...(cadence === "annual"
      ? [{ key: "cadence", label: "Annual", onRemove: () => selectCadence("weekly") }]
      : []),
    ...(type
      ? [
          {
            key: "type",
            label: forfeitDisplayLabel(type, subType),
            onRemove: () => selectForfeit(null),
          },
        ]
      : []),
    ...(gameweek
      ? [{ key: "gameweek", label: `GW ${gameweek}`, onRemove: () => selectGameweek(null) }]
      : []),
    ...(person
      ? [
          {
            key: "person",
            label: participantLabelForSlug(person),
            onRemove: () => selectPerson(null),
          },
        ]
      : []),
  ]

  return (
    <>
      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSheetOpen(true)}
          className="shrink-0 rounded-full font-semibold"
        >
          <SlidersHorizontal className="text-muted-foreground" />
          Filters
          {active.length > 0 && (
            <Badge className="size-5 justify-center rounded-full px-0 text-[11px] font-bold tabular-nums">
              {active.length}
            </Badge>
          )}
        </Button>

        {active.map((filter) => (
          <Badge
            key={filter.key}
            asChild
            variant="outline"
            className="h-9 shrink-0 gap-1.5 rounded-full border-primary/35 bg-primary/15 pr-2.5 pl-3.5 text-xs font-semibold text-primary hover:bg-primary/20"
          >
            <button
              type="button"
              aria-label={`Remove ${filter.label} filter`}
              onClick={filter.onRemove}
            >
              {filter.label}
              <X />
            </button>
          </Badge>
        ))}

        {active.length === 0 && (
          <span className="shrink-0 text-muted-foreground text-xs">Showing everything</span>
        )}
      </div>

      <ForfeitsFilterSheet
        scope={scope}
        leagueSelectable={leagueSelectable}
        open={isSheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  )
}
