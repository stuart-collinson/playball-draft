import { CupBracketHeadings } from "@pbd/components/Cup/CupBracketHeadings"
import { CupTieCard } from "@pbd/components/Cup/CupTieCard"
import { cn } from "@pbd/lib/className"
import {
  CUP_BRACKET_GRID,
  CUP_BRACKET_PLACEMENT,
  CUP_BRACKET_WIDE_FRAME,
  CUP_ROUNDS,
} from "@pbd/lib/constants/Cups"
import type { CupLive } from "@pbd/lib/cups/live"
import type { CupFormat, CupSchedule, CupTie } from "@pbd/types/cups.types"
import type { JSX } from "react"

type Props = {
  format: CupFormat
  schedule: CupSchedule
  ties: CupTie[]
  live: CupLive | null
}

export const CupBracketWide = ({ format, schedule, ties, live }: Props): JSX.Element => {
  const liveRounds = CUP_ROUNDS.filter((round) =>
    ties.some((tie) => tie.round === round && tie.status === "live"),
  )

  return (
    <div className={CUP_BRACKET_WIDE_FRAME}>
      <CupBracketHeadings format={format} schedule={schedule} liveRounds={liveRounds} />

      <div className={cn(CUP_BRACKET_GRID, "items-center gap-y-3")}>
        {ties.map((tie) => (
          <div key={tie.id} className={CUP_BRACKET_PLACEMENT[tie.round][tie.position]}>
            <CupTieCard tie={tie} live={live} isFinal={tie.round === "final"} />
          </div>
        ))}
      </div>
    </div>
  )
}
