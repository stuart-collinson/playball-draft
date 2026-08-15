"use client"

import { LEAGUE_PILL_ACTIVE_CLASSES, LEAGUE_SLUGS } from "@pbd/lib/constants/fpl"
import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import { COMBINED_LABEL, COMBINED_SCOPE, getLeagueLabel } from "@pbd/lib/leagues"
import type { LeagueScope } from "@pbd/lib/leagues"
import { cn } from "@pbd/lib/utils/cn"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { JSX } from "react"

const SECTIONS_WITHOUT_COMBINED = ["picks"]

const SECTIONS_WITHOUT_FILTER = ["extra", "spin-the-wheel"]

const PILL_BASE = "rounded-full px-3 py-1 text-xs font-medium transition-colors"

const PILL_INACTIVE = "text-muted-foreground hover:bg-accent hover:text-foreground"

export const LeagueFilter = (): JSX.Element | null => {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  const section = segments[0] ?? ""
  const activeScope = segments[1] ?? COMBINED_SCOPE
  const trailing = segments.slice(2)

  if (SECTIONS_WITHOUT_FILTER.includes(section)) return null

  const hrefFor = (scope: LeagueScope): string => ["", section, scope, ...trailing].join("/")

  const showCombined = !SECTIONS_WITHOUT_COMBINED.includes(section)

  return (
    <div className="flex gap-1.5">
      {showCombined && (
        <Link
          href={hrefFor(COMBINED_SCOPE)}
          className={cn(
            PILL_BASE,
            activeScope === COMBINED_SCOPE ? "bg-accent text-foreground" : PILL_INACTIVE,
          )}
        >
          {COMBINED_LABEL}
        </Link>
      )}

      {LEAGUE_SLUGS.map((slug: LeagueSlug) => (
        <Link
          key={slug}
          href={hrefFor(slug)}
          className={cn(
            PILL_BASE,
            activeScope === slug ? LEAGUE_PILL_ACTIVE_CLASSES[slug] : PILL_INACTIVE,
          )}
        >
          {getLeagueLabel(slug)}
        </Link>
      ))}
    </div>
  )
}
