"use client"

import { ToggleGroup, ToggleGroupItem } from "@pbd/components/ui/toggle-group"
import { FORFEIT_TYPES, WILDCARD_SUB_TYPES } from "@pbd/lib/constants/Forfeits"
import type { ForfeitCadence } from "@pbd/lib/constants/Forfeits"
import { FILTER_CHIP_PILL_CLASSES } from "@pbd/lib/constants/Pills"
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

const ALL_TYPES = "all"

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
    <ToggleGroup
      type="single"
      value={selected ?? ALL_TYPES}
      onValueChange={(value) => onSelect(value === ALL_TYPES || value === "" ? null : value)}
      spacing={2}
      aria-label="Forfeit type"
      className="w-full flex-wrap justify-start"
    >
      <ToggleGroupItem value={ALL_TYPES} className={FILTER_CHIP_PILL_CLASSES}>
        All
      </ToggleGroupItem>
      {optionsFor(cadence).map((option) => (
        <ToggleGroupItem key={option.slug} value={option.slug} className={FILTER_CHIP_PILL_CLASSES}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  </section>
)
