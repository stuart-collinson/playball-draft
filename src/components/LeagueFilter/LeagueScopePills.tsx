"use client"

import { FilterPill } from "@pbd/components/FilterPill/FilterPill"
import { LEAGUE_PILL_ACTIVE_CLASSES, LEAGUE_SLUGS } from "@pbd/lib/constants/Fpl"
import {
  COMBINED_LABEL,
  COMBINED_SCOPE,
  SECTION_SUPPORTS_COMBINED,
  getLeagueLabel,
} from "@pbd/lib/leagues"
import type { LeagueScope } from "@pbd/lib/leagues"
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
    <div className="flex gap-1.5">
      {SECTION_SUPPORTS_COMBINED(section) && (
        <FilterPill href={hrefFor(COMBINED_SCOPE)} isActive={activeScope === COMBINED_SCOPE}>
          {COMBINED_LABEL}
        </FilterPill>
      )}

      {LEAGUE_SLUGS.map((slug) => (
        <FilterPill
          key={slug}
          href={hrefFor(slug)}
          isActive={activeScope === slug}
          activeClassName={LEAGUE_PILL_ACTIVE_CLASSES[slug]}
        >
          {getLeagueLabel(slug)}
        </FilterPill>
      ))}
    </div>
  )
}
