"use client"

import { ForfeitPersonPicker } from "@pbd/components/Forfeits/ForfeitPersonPicker"
import { ForfeitTypePicker } from "@pbd/components/Forfeits/ForfeitTypePicker"
import { ForfeitWeekPicker } from "@pbd/components/Forfeits/ForfeitWeekPicker"
import { Button } from "@pbd/components/ui/Button"
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@pbd/components/ui/sheet"
import { useForfeitFilterActions } from "@pbd/hooks/forfeits/useForfeitFilterActions"
import { useForfeitFilters } from "@pbd/hooks/forfeits/useForfeitFilters"
import { useGameState } from "@pbd/hooks/fpl/useGameState"
import type { LeagueScope } from "@pbd/lib/leagues"
import { leaguePeople } from "@pbd/lib/people"
import type { JSX } from "react"

type Props = {
  scope: LeagueScope
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ForfeitsFilterSheet = ({ scope, open, onOpenChange }: Props): JSX.Element => {
  const { cadence, gameweek, type, subType, person, hasActiveFilters } = useForfeitFilters()
  const { selectForfeit, selectGameweek, selectPerson, clearFilters } = useForfeitFilterActions()
  const { data: gameState } = useGameState()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby={undefined}>
        <SheetTitle className="sr-only">Filter forfeits</SheetTitle>

        <div className="flex flex-col gap-5 overflow-y-auto pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ForfeitTypePicker
            cadence={cadence}
            selected={subType ?? type}
            onSelect={selectForfeit}
          />
          {cadence === "weekly" && (
            <ForfeitWeekPicker
              playedGameweeks={gameState?.currentEvent ?? 0}
              selected={gameweek}
              onSelect={selectGameweek}
            />
          )}
          <ForfeitPersonPicker
            people={leaguePeople(scope)}
            selected={person}
            onSelect={selectPerson}
          />
        </div>

        <div className="flex shrink-0 items-center gap-3 border-border border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="shrink-0"
          >
            Clear all
          </Button>
          <SheetClose asChild>
            <Button className="flex-1">Show forfeits</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
