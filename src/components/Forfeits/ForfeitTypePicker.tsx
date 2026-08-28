"use client"

import { FORFEIT_TYPES, WILDCARD_SUB_TYPES } from "@pbd/lib/constants/Forfeits"
import type { ForfeitCadence } from "@pbd/lib/constants/Forfeits"
import { cn } from "@pbd/lib/utils/cn"
import type { JSX } from "react"

type Props = {
  cadence: ForfeitCadence
  selected: string | null
  onSelect: (slug: string | null) => void
}

type TypeOption = {
  slug: string
  label: string
}

const WILDCARD_TYPE = "wildcard"

const CHIP_BASE =
  "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

const CHIP_ACTIVE = "border-primary/45 bg-primary/15 text-foreground"

const CHIP_INACTIVE = "border-border bg-background text-foreground/80 hover:border-primary/40"

const optionsFor = (cadence: ForfeitCadence): TypeOption[] =>
  FORFEIT_TYPES.filter((forfeitType) => forfeitType.category === cadence).flatMap(
    (forfeitType): TypeOption[] =>
      forfeitType.slug === WILDCARD_TYPE
        ? [
            { slug: forfeitType.slug, label: forfeitType.label },
            ...WILDCARD_SUB_TYPES.map((outcome) => ({
              slug: outcome.slug,
              label: outcome.label,
            })),
          ]
        : [{ slug: forfeitType.slug, label: forfeitType.label }],
  )

export const ForfeitTypePicker = ({ cadence, selected, onSelect }: Props): JSX.Element => (
  <section className="flex flex-col gap-2.5">
    <h3 className="font-bold text-[10px] text-muted-foreground uppercase tracking-[0.13em]">
      Forfeit
    </h3>
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={selected === null}
        onClick={() => onSelect(null)}
        className={cn(CHIP_BASE, selected === null ? CHIP_ACTIVE : CHIP_INACTIVE)}
      >
        All
      </button>
      {optionsFor(cadence).map((option) => (
        <button
          key={option.slug}
          type="button"
          aria-pressed={selected === option.slug}
          onClick={() => onSelect(option.slug)}
          className={cn(CHIP_BASE, selected === option.slug ? CHIP_ACTIVE : CHIP_INACTIVE)}
        >
          {option.label}
        </button>
      ))}
    </div>
  </section>
)
