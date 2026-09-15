"use client"

import { ToggleGroup, ToggleGroupItem } from "@pbd/components/ui/toggle-group"
import { cn } from "@pbd/lib/className"
import { FILTER_CHIP_CLASSES } from "@pbd/lib/constants/Pills"
import type { JSX } from "react"

type Props = {
  playedGameweeks: number
  selected: string | null
  onSelect: (gameweek: string | null) => void
}

const ALL_WEEKS = "all"

const CELL_CLASSES = cn(FILTER_CHIP_CLASSES, "rounded-xl px-0 py-2")

export const ForfeitWeekPicker = ({
  playedGameweeks,
  selected,
  onSelect,
}: Props): JSX.Element | null => {
  if (playedGameweeks === 0) return null

  const weeks = Array.from({ length: playedGameweeks }, (_, index) => String(index + 1))

  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-[0.13em]">
        Game week
      </h3>
      <ToggleGroup
        type="single"
        value={selected ?? ALL_WEEKS}
        onValueChange={(value) => onSelect(value === ALL_WEEKS || value === "" ? null : value)}
        spacing={1.5}
        aria-label="Game week"
        className="grid w-full grid-cols-6"
      >
        <ToggleGroupItem value={ALL_WEEKS} className={cn(CELL_CLASSES, "col-span-6")}>
          All weeks
        </ToggleGroupItem>
        {weeks.map((week) => (
          <ToggleGroupItem
            key={week}
            value={week}
            aria-label={`Game week ${week}`}
            className={CELL_CLASSES}
          >
            {week}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </section>
  )
}
