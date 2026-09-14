"use client"

import { FilterPill } from "@pbd/components/FilterPill/FilterPill"
import { useForfeitFilters } from "@pbd/hooks/forfeits/useForfeitFilters"
import { FORFEIT_FILTER_PARAMS } from "@pbd/lib/constants/Forfeits"
import type { ForfeitCadence } from "@pbd/lib/constants/Forfeits"
import { useSearchParams } from "next/navigation"
import type { JSX } from "react"

const OPTIONS: { value: ForfeitCadence; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "annual", label: "Annual" },
]

const PILL_ACTIVE = "bg-primary text-primary-foreground"

export const ForfeitCadenceFilter = (): JSX.Element => {
  const searchParams = useSearchParams()
  const { cadence } = useForfeitFilters()

  const select = (value: ForfeitCadence): void => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "weekly") params.delete(FORFEIT_FILTER_PARAMS.cadence)
    else params.set(FORFEIT_FILTER_PARAMS.cadence, value)
    params.delete(FORFEIT_FILTER_PARAMS.type)
    params.delete(FORFEIT_FILTER_PARAMS.subType)
    params.delete(FORFEIT_FILTER_PARAMS.gameweek)

    const queryString = params.toString()
    window.history.pushState(null, "", queryString ? `?${queryString}` : window.location.pathname)
  }

  return (
    <div className="flex gap-1.5">
      {OPTIONS.map((option) => (
        <FilterPill
          key={option.value}
          onClick={() => select(option.value)}
          isActive={cadence === option.value}
          activeClassName={PILL_ACTIVE}
        >
          {option.label}
        </FilterPill>
      ))}
    </div>
  )
}
