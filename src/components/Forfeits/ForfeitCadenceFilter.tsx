"use client"

import { ToggleGroup, ToggleGroupItem } from "@pbd/components/ui/toggle-group"
import { useForfeitFilters } from "@pbd/hooks/forfeits/useForfeitFilters"
import { cn } from "@pbd/lib/className"
import { FORFEIT_FILTER_PARAMS } from "@pbd/lib/constants/Forfeits"
import type { ForfeitCadence } from "@pbd/lib/constants/Forfeits"
import { PILL_ITEM_CLASSES } from "@pbd/lib/constants/Pills"
import { useSearchParams } from "next/navigation"
import type { JSX } from "react"

const OPTIONS: { value: ForfeitCadence; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "annual", label: "Annual" },
]

const PILL_ACTIVE = "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"

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

  const onValueChange = (value: string): void => {
    const option = OPTIONS.find((candidate) => candidate.value === value)
    if (option) select(option.value)
  }

  return (
    <ToggleGroup
      type="single"
      value={cadence}
      onValueChange={onValueChange}
      size="sm"
      spacing={1}
      aria-label="Forfeit cadence"
    >
      {OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className={cn(PILL_ITEM_CLASSES, PILL_ACTIVE)}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
