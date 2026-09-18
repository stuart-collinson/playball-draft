import { cn } from "@pbd/lib/className"
import { CUP_ROUND_LABELS } from "@pbd/lib/constants/Cups"
import { cupRoundGameweekLabel } from "@pbd/lib/cups/labels"
import type { CupFormat, CupRound, CupSchedule } from "@pbd/types/cups.types"
import type { JSX } from "react"

type Props = {
  format: CupFormat
  schedule: CupSchedule
  liveRounds: CupRound[]
}

const COLUMNS: { key: string; round: CupRound }[] = [
  { key: "round_of_16-left", round: "round_of_16" },
  { key: "quarter_final-left", round: "quarter_final" },
  { key: "semi_final-left", round: "semi_final" },
  { key: "final", round: "final" },
  { key: "semi_final-right", round: "semi_final" },
  { key: "quarter_final-right", round: "quarter_final" },
  { key: "round_of_16-right", round: "round_of_16" },
]

export const CupBracketHeadings = ({ format, schedule, liveRounds }: Props): JSX.Element => (
  <div className="grid grid-cols-[repeat(3,1fr)_1.55fr_repeat(3,1fr)] gap-x-6 2xl:gap-x-10">
    {COLUMNS.map(({ key, round }) => (
      <div key={key} className="flex min-w-0 flex-col items-center gap-0.5 text-center">
        <span className="truncate font-black text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
          {CUP_ROUND_LABELS[round]}
        </span>
        <span
          className={cn(
            "font-bold text-[10px] uppercase tracking-wider",
            liveRounds.includes(round) ? "text-primary" : "text-muted-foreground",
          )}
        >
          {cupRoundGameweekLabel(format, schedule, round)}
        </span>
      </div>
    ))}
  </div>
)
