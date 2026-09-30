import { cn } from "@pbd/lib/className"
import { CUP_BRACKET_COLUMNS, CUP_BRACKET_GRID, CUP_ROUND_LABELS } from "@pbd/lib/constants/Cups"
import { cupRoundGameweekLabel } from "@pbd/lib/cups/labels"
import type { CupFormat, CupRound, CupSchedule } from "@pbd/types/cups.types"
import type { JSX } from "react"

type Props = {
  format: CupFormat
  schedule: CupSchedule
  liveRounds: CupRound[]
}

export const CupBracketHeadings = ({ format, schedule, liveRounds }: Props): JSX.Element => (
  <div className={CUP_BRACKET_GRID}>
    {CUP_BRACKET_COLUMNS.map(({ key, round }) => (
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
