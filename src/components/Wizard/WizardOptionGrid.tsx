"use client"

import { ToggleGroup, ToggleGroupItem } from "@pbd/components/ui/toggle-group"
import { cn } from "@pbd/lib/className"
import type { JSX } from "react"

type Option = {
  value: string
  label: string
  hint?: string
  fullWidth?: boolean
}

type Props = {
  options: Option[]
  selected: string | readonly string[]
  onSelect: (value: string) => void
  columns?: 2 | 5
}

const COLUMN_CLASSES: Record<2 | 5, string> = {
  2: "grid-cols-2",
  5: "grid-cols-5",
}

const CELL_CLASSES: Record<2 | 5, string> = {
  2: "min-h-16 p-3",
  5: "min-h-12 p-2",
}

const OPTION_CLASSES =
  "group/option h-auto flex-col gap-0.5 rounded-xl border bg-background px-2 text-center text-sm font-semibold text-foreground/80 hover:border-primary/40 hover:bg-accent/50 hover:text-foreground/80 data-[state=on]:border-primary data-[state=on]:bg-primary/15 data-[state=on]:text-foreground data-[state=on]:ring-1 data-[state=on]:ring-primary/40"

const GRID_SPACING = 2

export const WizardOptionGrid = ({
  options,
  selected,
  onSelect,
  columns = 2,
}: Props): JSX.Element => {
  const groupProps =
    typeof selected === "string"
      ? { type: "single" as const, value: selected }
      : { type: "multiple" as const, value: [...selected] }

  return (
    <ToggleGroup
      {...groupProps}
      spacing={GRID_SPACING}
      className={cn("grid w-full", COLUMN_CLASSES[columns])}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          onClick={() => onSelect(option.value)}
          className={cn(OPTION_CLASSES, CELL_CLASSES[columns], option.fullWidth && "col-span-full")}
        >
          <span className="break-words">{option.label}</span>
          {option.hint && (
            <span className="break-words text-[10px] uppercase tracking-wider text-muted-foreground group-data-[state=on]/option:text-primary">
              {option.hint}
            </span>
          )}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
