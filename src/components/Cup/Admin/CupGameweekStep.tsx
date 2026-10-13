"use client"

import { WizardOptionGrid } from "@pbd/components/Wizard/WizardOptionGrid"
import { cupRoundGameweekLabel } from "@pbd/lib/cups/labels"
import { cupLegCount } from "@pbd/lib/cups/rounds"
import { cupGameweekOptions } from "@pbd/lib/cups/schedule"
import type { CupFormat, CupRound, CupSchedule } from "@pbd/types/cups.types"
import type { JSX } from "react"

type Props = {
  format: CupFormat
  round: CupRound
  schedule: CupSchedule
  firstOpenGameweek: number
  onSelect: (gameweek: number) => void
}

const GAMEWEEK_COLUMNS = 8

const TWO_LEG_HINT = "Two legs, so the round also takes the week after."

const SINGLE_LEG_HINT = "One game week."

const LEGEND = "Greyed weeks have gone, clash with another round, or leave no room after."

export const CupGameweekStep = ({
  format,
  round,
  schedule,
  firstOpenGameweek,
  onSelect,
}: Props): JSX.Element => {
  const options = cupGameweekOptions(format, round, schedule, firstOpenGameweek)
  const isTwoLegged = cupLegCount(format, round) > 1

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-xs">
        {isTwoLegged ? TWO_LEG_HINT : SINGLE_LEG_HINT}
      </p>

      <WizardOptionGrid
        options={options.map((option) => ({
          value: String(option.gameweek),
          label: String(option.gameweek),
          disabled: option.block !== null,
        }))}
        selected={String(schedule[round])}
        onSelect={(value) => onSelect(Number(value))}
        columns={GAMEWEEK_COLUMNS}
      />

      <div className="flex items-baseline justify-between gap-3">
        <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{LEGEND}</p>
        <span className="shrink-0 font-bold text-foreground text-sm">
          {cupRoundGameweekLabel(format, schedule, round)}
        </span>
      </div>
    </div>
  )
}
