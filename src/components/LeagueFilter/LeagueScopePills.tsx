"use client"

import { ToggleGroup, ToggleGroupItem } from "@pbd/components/ui/toggle-group"
import { cn } from "@pbd/lib/className"
import { LEAGUE_PILL_ACTIVE_CLASSES, LEAGUE_SLUGS } from "@pbd/lib/constants/Fpl"
import { PILL_ITEM_CLASSES } from "@pbd/lib/constants/Pills"
import {
  COMBINED_LABEL,
  COMBINED_SCOPE,
  SECTION_SUPPORTS_COMBINED,
  getLeagueLabel,
} from "@pbd/lib/leagues"
import type { LeagueScope } from "@pbd/lib/leagues"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { JSX } from "react"

type Props = {
  section: string
  activeScope: string
  trailing: string[]
}

export const LeagueScopePills = ({ section, activeScope, trailing }: Props): JSX.Element => {
  const query = useSearchParams().toString()

  const hrefFor = (scope: LeagueScope): string => {
    const path = ["", section, scope, ...trailing].join("/")
    return query ? `${path}?${query}` : path
  }

  return (
    <ToggleGroup type="single" value={activeScope} size="sm" spacing={1} aria-label="League">
      {SECTION_SUPPORTS_COMBINED(section) && (
        <ToggleGroupItem value={COMBINED_SCOPE} asChild className={PILL_ITEM_CLASSES}>
          <Link href={hrefFor(COMBINED_SCOPE)} prefetch={true}>
            {COMBINED_LABEL}
          </Link>
        </ToggleGroupItem>
      )}

      {LEAGUE_SLUGS.map((slug) => (
        <ToggleGroupItem
          key={slug}
          value={slug}
          asChild
          className={cn(PILL_ITEM_CLASSES, LEAGUE_PILL_ACTIVE_CLASSES[slug])}
        >
          <Link href={hrefFor(slug)} prefetch={true}>
            {getLeagueLabel(slug)}
          </Link>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
