import { CupRoundHeading } from "@pbd/components/Cup/CupRoundHeading"
import { CupRoundPanel } from "@pbd/components/Cup/CupRoundPanel"
import { CupTieRow } from "@pbd/components/Cup/CupTieRow"
import { CUP_ROUNDS } from "@pbd/lib/constants/Cups"
import { cupRoundTotalDigits } from "@pbd/lib/cups/live"
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
      const totalDigits = cupRoundTotalDigits(roundTies, live)

      return (
        <CupRoundPanel key={round} isFinal={isFinal}>
          <CupRoundHeading
            round={round}
            format={format}
            schedule={schedule}
            isLive={roundTies.some((tie) => tie.status === "live")}
          />
          <div className="flex flex-col gap-2">
            {roundTies.map((tie) => (
              <CupTieRow
                key={tie.id}
                tie={tie}
                live={live}
                isFinal={isFinal}
                totalDigits={totalDigits}
              />
            ))}
          </div>
        </CupRoundPanel>
      )
    })}
  </div>
)
