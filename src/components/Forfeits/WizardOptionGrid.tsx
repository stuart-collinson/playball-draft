import { cn } from "@pbd/lib/utils/cn"
import type { JSX } from "react"

type Option = {
  value: string
  label: string
  hint?: string
}

type Props = {
  options: Option[]
  selected: string
  onSelect: (value: string) => void
  columns?: 2 | 5
}

const COLUMN_CLASSES: Record<2 | 5, string> = {
  2: "grid-cols-2",
  5: "grid-cols-5",
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
        aria-pressed={selected === option.value}
        onClick={() => onSelect(option.value)}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 rounded-xl border p-3 text-center text-sm font-medium transition-colors",
          selected === option.value
            ? "border-foreground/60 bg-accent text-foreground"
            : "border-border bg-background text-foreground/80 hover:bg-accent/50",
        )}
      >
        <span>{option.label}</span>
        {option.hint && (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {option.hint}
          </span>
        )}
      </button>
    ))}
  </div>
)
