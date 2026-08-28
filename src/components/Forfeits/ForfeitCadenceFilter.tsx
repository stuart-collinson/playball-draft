"use client"

import { FORFEIT_FILTER_PARAMS, useForfeitFilters } from "@pbd/hooks/forfeits/useForfeitFilters"
import type { ForfeitCadence } from "@pbd/lib/constants/Forfeits"
import { cn } from "@pbd/lib/utils/cn"
import { useSearchParams } from "next/navigation"
import type { JSX } from "react"

const OPTIONS: { value: ForfeitCadence; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "annual", label: "Annual" },
]

const PILL_BASE = "rounded-full px-3 py-1 text-xs font-medium transition-colors"

const PILL_INACTIVE = "text-muted-foreground hover:bg-accent hover:text-foreground"

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
        <button
          key={option.value}
          type="button"
          onClick={() => select(option.value)}
          className={cn(PILL_BASE, cadence === option.value ? PILL_ACTIVE : PILL_INACTIVE)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
