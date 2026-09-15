import { parseForfeitFilters } from "@pbd/lib/forfeits/filters"
import type { ForfeitFilterValues } from "@pbd/lib/forfeits/filters"
import { useSearchParams } from "next/navigation"

export type ForfeitFilters = ForfeitFilterValues & {
  hasActiveFilters: boolean
}

export const useForfeitFilters = (): ForfeitFilters => {
  const searchParams = useSearchParams()
  const filters = parseForfeitFilters((key) => searchParams.get(key))

  return {
    ...filters,
    hasActiveFilters: Boolean(
      filters.cadence === "annual" ||
        filters.gameweek ||
        filters.type ||
        filters.subType ||
        filters.person,
    ),
  }
}
