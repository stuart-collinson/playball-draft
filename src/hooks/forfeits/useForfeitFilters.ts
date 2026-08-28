import { useSearchParams } from "next/navigation"

export const FORFEIT_FILTER_PARAMS = {
  gameweek: "gw",
  type: "type",
  subType: "sub",
  person: "person",
} as const

export type ForfeitFilters = {
  gameweek: string | null
  type: string | null
  subType: string | null
  person: string | null
  hasActiveFilters: boolean
}

export const useForfeitFilters = (): ForfeitFilters => {
  const searchParams = useSearchParams()
  const gameweek = searchParams.get(FORFEIT_FILTER_PARAMS.gameweek)
  const type = searchParams.get(FORFEIT_FILTER_PARAMS.type)
  const subType = searchParams.get(FORFEIT_FILTER_PARAMS.subType)
  const person = searchParams.get(FORFEIT_FILTER_PARAMS.person)

  return {
    gameweek,
    type,
    subType,
    person,
    hasActiveFilters: Boolean(gameweek || type || subType || person),
  }
}
