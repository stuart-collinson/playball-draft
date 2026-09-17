import { CupBracketHeadings } from "@pbd/components/Cup/CupBracketHeadings"
import { CupTieCard } from "@pbd/components/Cup/CupTieCard"
import { CUP_ROUNDS } from "@pbd/lib/constants/Cups"
import type { CupLive } from "@pbd/lib/cups/live"
import type { CupFormat, CupRound, CupSchedule, CupTie } from "@pbd/types/cups.types"
import type { JSX } from "react"

type Props = {
  format: CupFormat
  schedule: CupSchedule
  ties: CupTie[]
  live: CupLive | null
}

const PLACEMENT: Record<CupRound, string[]> = {
  round_of_16: [
    "col-start-1 row-start-1",
    "col-start-1 row-start-2",
    "col-start-1 row-start-3",
    "col-start-1 row-start-4",
    "col-start-7 row-start-1",
    "col-start-7 row-start-2",
    "col-start-7 row-start-3",
    "col-start-7 row-start-4",
  ],
  quarter_final: [
    "col-start-2 row-start-1 row-span-2",
    "col-start-2 row-start-3 row-span-2",
    "col-start-6 row-start-1 row-span-2",
    "col-start-6 row-start-3 row-span-2",
  ],
  semi_final: ["col-start-3 row-start-1 row-span-4", "col-start-5 row-start-1 row-span-4"],
  final: ["col-start-4 row-start-1 row-span-4"],
}

export const CupBracketWide = ({ format, schedule, ties, live }: Props): JSX.Element => {
  const liveRounds = CUP_ROUNDS.filter((round) =>
    ties.some((tie) => tie.round === round && tie.status === "live"),
  )

  return (
    <div className="hidden flex-col gap-3 xl:-mx-28 xl:flex 2xl:-mx-56">
      <CupBracketHeadings format={format} schedule={schedule} liveRounds={liveRounds} />

      <div className="grid grid-cols-[repeat(3,1fr)_1.55fr_repeat(3,1fr)] items-center gap-x-6 gap-y-3 2xl:gap-x-10">
        {ties.map((tie) => (
          <div key={tie.id} className={PLACEMENT[tie.round][tie.position]}>
            <CupTieCard tie={tie} live={live} isFinal={tie.round === "final"} />
          </div>
        ))}
      </div>
    </div>
  )
}
