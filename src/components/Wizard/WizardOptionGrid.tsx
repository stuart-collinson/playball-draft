"use client"

import { ToggleGroup, ToggleGroupItem } from "@pbd/components/ui/toggle-group"
import { cn } from "@pbd/lib/className"
import type { JSX } from "react"

type Option = {
  value: string
  label: string
  hint?: string
  fullWidth?: boolean
  disabled?: boolean
}

type Columns = 2 | 3 | 8

type Props = {
  options: Option[]
  selected: string | readonly string[]
  onSelect: (value: string) => void
  columns?: Columns
}

const COLUMN_CLASSES: Record<Columns, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  8: "grid-cols-8",
}

const CELL_CLASSES: Record<Columns, string> = {
  2: "min-h-16 p-3",
  3: "min-h-11 p-1",
  8: "min-h-10 p-1",
}

const GRID_SPACING: Record<Columns, number> = {
  2: 2,
  3: 1.5,
  8: 1.5,
}

const OPTION_CLASSES =
  "group/option h-auto flex-col gap-0.5 rounded-xl border bg-background px-2 text-center text-sm font-semibold text-foreground/80 hover:border-primary/40 hover:bg-accent/50 hover:text-foreground/80 data-[state=on]:border-primary data-[state=on]:bg-primary/15 data-[state=on]:text-foreground data-[state=on]:ring-1 data-[state=on]:ring-primary/40 disabled:pointer-events-none disabled:border-dashed disabled:bg-transparent disabled:text-muted-foreground/40 disabled:opacity-100"

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
      spacing={GRID_SPACING[columns]}
      className={cn("grid w-full", COLUMN_CLASSES[columns])}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}
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
