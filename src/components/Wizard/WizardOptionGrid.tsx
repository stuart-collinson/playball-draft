import { cn } from "@pbd/lib/utils/cn"
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

const isSelected = (selected: string | readonly string[], value: string): boolean =>
  Array.isArray(selected) ? selected.includes(value) : selected === value

const COLUMN_CLASSES: Record<2 | 5, string> = {
  2: "grid-cols-2",
  5: "grid-cols-5",
}

const CELL_CLASSES: Record<2 | 5, string> = {
  2: "min-h-16 p-3",
  5: "min-h-12 p-2",
}

export const WizardOptionGrid = ({
  options,
  selected,
  onSelect,
  columns = 2,
}: Props): JSX.Element => (
  <div className={cn("grid gap-2", COLUMN_CLASSES[columns])}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={isSelected(selected, option.value)}
        onClick={() => onSelect(option.value)}
        className={cn(
          "flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border text-center text-sm font-semibold transition-colors",
          CELL_CLASSES[columns],
          option.fullWidth && "col-span-full",
          isSelected(selected, option.value)
            ? "border-primary bg-primary/15 text-foreground ring-1 ring-primary/40"
            : "border-border bg-background text-foreground/80 hover:border-primary/40 hover:bg-accent/50",
        )}
      >
        <span className="break-words">{option.label}</span>
        {option.hint && (
          <span
            className={cn(
              "break-words text-[10px] uppercase tracking-wider",
              isSelected(selected, option.value) ? "text-primary" : "text-muted-foreground",
            )}
          >
            {option.hint}
          </span>
        )}
      </button>
    ))}
  </div>
)
