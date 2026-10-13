"use client"

import { ToggleGroup, ToggleGroupItem } from "@pbd/components/ui/toggle-group"
import { LEAGUE_SLUGS } from "@pbd/lib/constants/Fpl"
import { FILTER_CHIP_PILL_CLASSES } from "@pbd/lib/constants/Pills"
import { COMBINED_SCOPE, IS_VALID_LEAGUE_SCOPE, getLeagueLabel } from "@pbd/lib/leagues"
import type { LeagueScope } from "@pbd/lib/leagues"
import type { JSX } from "react"

type Props = {
  selected: LeagueScope
  onSelect: (scope: LeagueScope) => void
}

const SCOPES: LeagueScope[] = [COMBINED_SCOPE, ...LEAGUE_SLUGS]

export const ForfeitLeaguePicker = ({ selected, onSelect }: Props): JSX.Element => {
  const onValueChange = (value: string): void => {
    if (IS_VALID_LEAGUE_SCOPE(value) && value !== selected) onSelect(value)
  }

  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-[0.13em]">
        League
      </h3>
      <ToggleGroup
        type="single"
        value={selected}
        onValueChange={onValueChange}
        spacing={2}
        aria-label="League"
        className="w-full justify-start"
      >
        {SCOPES.map((scope) => (
          <ToggleGroupItem key={scope} value={scope} className={FILTER_CHIP_PILL_CLASSES}>
            {getLeagueLabel(scope)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </section>
  )
}
