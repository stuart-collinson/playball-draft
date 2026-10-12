import { cn } from "@pbd/lib/className"
import { CUP_ROUND_LABELS } from "@pbd/lib/constants/Cups"
import { cupRoundGameweekLabel } from "@pbd/lib/cups/labels"
import type { CupFormat, CupRound, CupSchedule } from "@pbd/types/cups.types"
import type { JSX } from "react"

type Props = {
  round: CupRound
  format: CupFormat
  schedule: CupSchedule
  isLive: boolean
}

export const CupRoundHeading = ({ round, format, schedule, isLive }: Props): JSX.Element => (
  <header className="mb-2.5 flex items-baseline justify-between gap-2 px-1">
    <h2 className="font-black text-[11px] text-foreground uppercase tracking-[0.2em]">
      {CUP_ROUND_LABELS[round]}
    </h2>
    <span
      className={cn(
        "shrink-0 font-bold text-[10px] uppercase tracking-wider",
        isLive ? "text-primary" : "text-muted-foreground",
      )}
    >
      {cupRoundGameweekLabel(format, schedule, round)}
    </span>
  </header>
)
