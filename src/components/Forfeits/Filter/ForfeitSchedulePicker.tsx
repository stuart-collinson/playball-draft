"use client"

import { ToggleGroup, ToggleGroupItem } from "@pbd/components/ui/toggle-group"
import type { ForfeitCadence } from "@pbd/lib/constants/Forfeits"
import { FILTER_CHIP_PILL_CLASSES } from "@pbd/lib/constants/Pills"
import type { JSX } from "react"

type Props = {
  selected: ForfeitCadence
  onSelect: (cadence: ForfeitCadence) => void
}

const OPTIONS: { value: ForfeitCadence; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "annual", label: "Annual" },
]

export const ForfeitSchedulePicker = ({ selected, onSelect }: Props): JSX.Element => {
  const onValueChange = (value: string): void => {
    const option = OPTIONS.find((candidate) => candidate.value === value)
    if (option) onSelect(option.value)
  }

  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-[0.13em]">
        Schedule
      </h3>
      <ToggleGroup
        type="single"
        value={selected}
        onValueChange={onValueChange}
        spacing={2}
        aria-label="Forfeit schedule"
        className="w-full justify-start"
      >
        {OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className={FILTER_CHIP_PILL_CLASSES}
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </section>
  )
}
