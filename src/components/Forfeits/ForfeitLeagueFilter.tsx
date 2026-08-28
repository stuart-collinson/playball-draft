"use client"

import { LEAGUE_PILL_ACTIVE_CLASSES, LEAGUE_SLUGS } from "@pbd/lib/constants/fpl"
import { COMBINED_LABEL, COMBINED_SCOPE, getLeagueLabel } from "@pbd/lib/leagues"
import type { LeagueScope } from "@pbd/lib/leagues"
import { cn } from "@pbd/lib/utils/cn"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { JSX } from "react"

type Props = {
  scope: LeagueScope
}

const PILL_BASE = "rounded-full px-3 py-1 text-xs font-medium transition-colors"

const PILL_INACTIVE = "text-muted-foreground hover:bg-accent hover:text-foreground"

export const ForfeitLeagueFilter = ({ scope }: Props): JSX.Element => {
  const searchParams = useSearchParams()
  const query = searchParams.toString()

  const hrefFor = (target: LeagueScope): string => {
    const path = `/forfeits/${target}`
    return query ? `${path}?${query}` : path
  }

  return (
    <div className="flex gap-1.5">
      <Link
        href={hrefFor(COMBINED_SCOPE)}
        className={cn(
          PILL_BASE,
          scope === COMBINED_SCOPE ? "bg-accent text-foreground" : PILL_INACTIVE,
        )}
      >
        {COMBINED_LABEL}
      </Link>
      {LEAGUE_SLUGS.map((slug) => (
        <Link
          key={slug}
          href={hrefFor(slug)}
          className={cn(
            PILL_BASE,
            scope === slug ? LEAGUE_PILL_ACTIVE_CLASSES[slug] : PILL_INACTIVE,
          )}
        >
          {getLeagueLabel(slug)}
        </Link>
      ))}
    </div>
  )
}
