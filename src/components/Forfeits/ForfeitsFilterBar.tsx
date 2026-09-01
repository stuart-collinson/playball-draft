"use client"

import { ForfeitsFilterSheet } from "@pbd/components/Forfeits/ForfeitsFilterSheet"
import { useForfeitFilterActions } from "@pbd/hooks/forfeits/useForfeitFilterActions"
import { useForfeitFilters } from "@pbd/hooks/forfeits/useForfeitFilters"
import { forfeitDisplayLabel } from "@pbd/lib/forfeits"
import type { LeagueScope } from "@pbd/lib/leagues"
import { participantLabelForSlug } from "@pbd/lib/people"
import { SlidersHorizontal, X } from "lucide-react"
import type { JSX } from "react"
import { useState } from "react"

type Props = {
  scope: LeagueScope
}

type ActiveFilter = {
  key: string
  label: string
  onRemove: () => void
}

export const ForfeitsFilterBar = ({ scope }: Props): JSX.Element => {
  const { gameweek, type, subType, person } = useForfeitFilters()
  const { selectForfeit, selectGameweek, selectPerson } = useForfeitFilterActions()
  const [isSheetOpen, setSheetOpen] = useState(false)

  const active: ActiveFilter[] = [
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
      ? [
          {
            key: "gameweek",
            label: `GW ${gameweek}`,
            onRemove: () => selectGameweek(null),
          },
        ]
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
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card py-2 pr-4 pl-3.5 font-semibold text-foreground text-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SlidersHorizontal size={15} className="text-muted-foreground" />
          Filters
          {active.length > 0 && (
            <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1.5 font-bold text-[11px] text-primary-foreground">
              {active.length}
            </span>
          )}
        </button>

        {active.map((filter) => (
          <button
            key={filter.key}
            type="button"
            aria-label={`Remove ${filter.label} filter`}
            onClick={filter.onRemove}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/35 bg-primary/15 py-2 pr-2.5 pl-3.5 font-semibold text-primary text-xs transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {filter.label}
            <X size={13} />
          </button>
        ))}

        {active.length === 0 && (
          <span className="shrink-0 text-muted-foreground text-xs">Showing everything</span>
        )}
      </div>

      <ForfeitsFilterSheet scope={scope} open={isSheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
