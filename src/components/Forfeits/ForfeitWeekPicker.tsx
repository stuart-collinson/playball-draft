"use client"

import { cn } from "@pbd/lib/utils/cn"
import type { JSX } from "react"

type Props = {
  playedGameweeks: number
  selected: string | null
  onSelect: (gameweek: string | null) => void
}

const CELL_BASE =
  "rounded-xl border py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

const CELL_ACTIVE = "border-primary/45 bg-primary/15 text-foreground"

const CELL_INACTIVE = "border-border bg-background text-foreground/80 hover:border-primary/40"

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
      <div className="grid grid-cols-6 gap-1.5">
        <button
          type="button"
          aria-pressed={selected === null}
          onClick={() => onSelect(null)}
          className={cn(CELL_BASE, "col-span-6", selected === null ? CELL_ACTIVE : CELL_INACTIVE)}
        >
          All weeks
        </button>
        {weeks.map((week) => (
          <button
            key={week}
            type="button"
            aria-label={`Game week ${week}`}
            aria-pressed={selected === week}
            onClick={() => onSelect(week)}
            className={cn(CELL_BASE, selected === week ? CELL_ACTIVE : CELL_INACTIVE)}
          >
            {week}
          </button>
        ))}
      </div>
    </section>
  )
}
