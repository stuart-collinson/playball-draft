import { useSearchParams } from "next/navigation"

import type { ForfeitCadence } from "@pbd/lib/constants/Forfeits"

export const FORFEIT_FILTER_PARAMS = {
  cadence: "cadence",
  gameweek: "gw",
  type: "type",
  subType: "sub",
  person: "person",
} as const

export type ForfeitFilters = {
  cadence: ForfeitCadence
  gameweek: string | null
  type: string | null
  subType: string | null
  person: string | null
  hasActiveFilters: boolean
}

export const useForfeitFilters = (): ForfeitFilters => {
  const searchParams = useSearchParams()
  const cadence: ForfeitCadence =
    searchParams.get(FORFEIT_FILTER_PARAMS.cadence) === "annual" ? "annual" : "weekly"
  const gameweek = searchParams.get(FORFEIT_FILTER_PARAMS.gameweek)
  const type = searchParams.get(FORFEIT_FILTER_PARAMS.type)
  const subType = searchParams.get(FORFEIT_FILTER_PARAMS.subType)
  const person = searchParams.get(FORFEIT_FILTER_PARAMS.person)

  return {
    cadence,
    gameweek,
    type,
    subType,
    person,
    hasActiveFilters: Boolean(gameweek || type || subType || person),
  }
}
