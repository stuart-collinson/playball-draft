import { LEAGUE_LABELS, LEAGUE_SLUGS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl"
import type { LeagueSlug } from "@pbd/lib/constants/fpl"

export type LeagueScope = LeagueSlug | "combined"

export const COMBINED_SCOPE = "combined" as const

export const COMBINED_LABEL = "Combined"

export const DEFAULT_LEAGUE_SLUG: LeagueSlug = LEAGUE_SLUGS[0] as LeagueSlug

export const IS_VALID_LEAGUE_SCOPE = (scope: string): scope is LeagueScope =>
  scope === COMBINED_SCOPE || LEAGUE_SLUGS.includes(scope as LeagueSlug)

export const getLeagueIds = (scope: LeagueScope): number[] =>
  scope === COMBINED_SCOPE
    ? LEAGUE_SLUGS.map((slug) => LEAGUE_SLUG_TO_ID[slug])
    : [LEAGUE_SLUG_TO_ID[scope]]

export const getLeagueLabel = (scope: LeagueScope): string =>
  scope === COMBINED_SCOPE ? COMBINED_LABEL : LEAGUE_LABELS[scope]
