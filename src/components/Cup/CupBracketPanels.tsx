import { CupRoundHeading } from "@pbd/components/Cup/CupRoundHeading"
import { CupTieRow } from "@pbd/components/Cup/CupTieRow"
import { cn } from "@pbd/lib/className"
import { CUP_ROUNDS } from "@pbd/lib/constants/Cups"
import type { CupLive } from "@pbd/lib/cups/live"
import type { CupFormat, CupSchedule, CupTie } from "@pbd/types/cups.types"
import type { JSX } from "react"

type Props = {
  format: CupFormat
  schedule: CupSchedule
  ties: CupTie[]
  live: CupLive | null
}

const byPosition = (first: CupTie, second: CupTie): number => first.position - second.position

export const CupBracketPanels = ({ format, schedule, ties, live }: Props): JSX.Element => (
  <div className="flex flex-col gap-3 xl:hidden">
    {CUP_ROUNDS.map((round) => {
      const roundTies = ties.filter((tie) => tie.round === round).sort(byPosition)
      const isFinal = round === "final"

      return (
        <section
          key={round}
          className={cn(
            "rounded-2xl border border-border/60 bg-card/40 p-3",
            isFinal && "border-amber-400/30 bg-amber-400/5",
          )}
        >
          <CupRoundHeading
            round={round}
            format={format}
            schedule={schedule}
            isLive={roundTies.some((tie) => tie.status === "live")}
          />
          <div className="flex flex-col gap-2">
            {roundTies.map((tie) => (
              <CupTieRow key={tie.id} tie={tie} live={live} isFinal={isFinal} />
            ))}
          </div>
        </section>
      )
    })}
  </div>
)
