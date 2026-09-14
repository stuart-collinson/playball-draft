import { FORFEIT_FILTER_PARAMS } from "@pbd/lib/constants/Forfeits"
import type { ForfeitCadence } from "@pbd/lib/constants/Forfeits"
import type { LeagueScope } from "@pbd/lib/leagues"
import { leaguePeople } from "@pbd/lib/people"

export type ForfeitsListFilters = {
  cadence: ForfeitCadence
  gameweek?: string | null
  type?: string | null
  subType?: string | null
  person?: string | null
}

export type ForfeitFilterValues = Required<ForfeitsListFilters>

export type ForfeitsListInput = {
  league?: "premiership" | "championship"
  cadence: ForfeitCadence
  gameweek?: string
  type?: string
  subType?: string
  person?: string
}

type SearchQuery = Record<string, string | string[] | undefined>

const firstValue = (value: string | string[] | undefined): string | null => {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === "string" && raw.length > 0 ? raw : null
}

export const parseForfeitFilters = (read: (key: string) => string | null): ForfeitFilterValues => ({
  cadence: read(FORFEIT_FILTER_PARAMS.cadence) === "annual" ? "annual" : "weekly",
  gameweek: read(FORFEIT_FILTER_PARAMS.gameweek),
  type: read(FORFEIT_FILTER_PARAMS.type),
  subType: read(FORFEIT_FILTER_PARAMS.subType),
  person: read(FORFEIT_FILTER_PARAMS.person),
})

export const readForfeitFilters = (query: SearchQuery): ForfeitFilterValues =>
  parseForfeitFilters((key) => firstValue(query[key]))

export const buildForfeitsListInput = (
  scope: LeagueScope,
  filters: ForfeitsListFilters,
): ForfeitsListInput => {
  const input: ForfeitsListInput = { cadence: filters.cadence }
  if (scope !== "combined") input.league = scope
  if (filters.cadence === "weekly" && filters.gameweek) input.gameweek = filters.gameweek
  if (filters.type) input.type = filters.type
  if (filters.subType && filters.type === "wildcard") input.subType = filters.subType
  if (filters.person && leaguePeople(scope).some((member) => member.slug === filters.person))
    input.person = filters.person

  return input
}
