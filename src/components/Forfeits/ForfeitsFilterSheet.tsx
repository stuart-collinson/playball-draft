"use client"

import { ForfeitLeaguePicker } from "@pbd/components/Forfeits/ForfeitLeaguePicker"
import { ForfeitPersonPicker } from "@pbd/components/Forfeits/ForfeitPersonPicker"
import { ForfeitSchedulePicker } from "@pbd/components/Forfeits/ForfeitSchedulePicker"
import { ForfeitTypePicker } from "@pbd/components/Forfeits/ForfeitTypePicker"
import { ForfeitWeekPicker } from "@pbd/components/Forfeits/ForfeitWeekPicker"
import { Button } from "@pbd/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@pbd/components/ui/drawer"
import { useForfeitFilterActions } from "@pbd/hooks/forfeits/useForfeitFilterActions"
import { useForfeitFilters } from "@pbd/hooks/forfeits/useForfeitFilters"
import { useGameState } from "@pbd/hooks/fpl/useGameState"
import { usePinnedPageScroll } from "@pbd/hooks/usePinnedPageScroll"
import { forfeitsHref } from "@pbd/lib/constants/Pages"
import { COMBINED_SCOPE } from "@pbd/lib/leagues"
import type { LeagueScope } from "@pbd/lib/leagues"
import { leaguePeople } from "@pbd/lib/people"
import { useRouter, useSearchParams } from "next/navigation"
import type { JSX } from "react"

type Props = {
  scope: LeagueScope
  leagueSelectable?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ForfeitsFilterSheet = ({
  scope,
  leagueSelectable = false,
  open,
  onOpenChange,
}: Props): JSX.Element => {
  const router = useRouter()
  const query = useSearchParams().toString()
  const { cadence, gameweek, type, subType, person, hasActiveFilters } = useForfeitFilters()
  const { selectCadence, selectForfeit, selectGameweek, selectPerson, clearFilters } =
    useForfeitFilterActions()
  const { data: gameState } = useGameState()

  usePinnedPageScroll(open)

  const isScoped = leagueSelectable && scope !== COMBINED_SCOPE

  const selectLeague = (next: LeagueScope): void =>
    router.push(query ? `${forfeitsHref(next)}?${query}` : forfeitsHref(next))

  const clearAll = (): void => {
    if (isScoped) router.push(forfeitsHref(COMBINED_SCOPE))
    else clearFilters()
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto select-none bg-card data-[vaul-drawer-direction=bottom]:max-h-[85dvh] data-[vaul-drawer-direction=bottom]:rounded-t-3xl sm:max-w-lg">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Filter forfeits</DrawerTitle>
          <DrawerDescription>
            Narrow the archive by league, schedule, forfeit, game week and person.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {leagueSelectable && <ForfeitLeaguePicker selected={scope} onSelect={selectLeague} />}
          <ForfeitSchedulePicker selected={cadence} onSelect={selectCadence} />
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

        <DrawerFooter className="flex-row items-center gap-3 border-t px-5 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={!hasActiveFilters && !isScoped}
            className="shrink-0"
          >
            Clear all
          </Button>
          <DrawerClose asChild>
            <Button className="flex-1">Show forfeits</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
