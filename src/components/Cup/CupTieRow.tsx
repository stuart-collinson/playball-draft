import { CupTieRowSide } from "@pbd/components/Cup/CupTieRowSide"
import { cn } from "@pbd/lib/className"
import { cupTieView } from "@pbd/lib/cups/live"
import type { CupLive, CupTotalDigits } from "@pbd/lib/cups/live"
import type { CupTie } from "@pbd/types/cups.types"
import type { JSX } from "react"

type Props = {
  tie: CupTie
  live: CupLive | null
  isFinal: boolean
  totalDigits: CupTotalDigits
}

export const CupTieRow = ({ tie, live, isFinal, totalDigits }: Props): JSX.Element => {
  const view = cupTieView(tie, live)
  const isDecided = tie.winner !== null

  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 rounded-xl border bg-card px-2 py-2",
        tie.status === "live" && "border-primary/50",
        isFinal &&
          "rounded-2xl border-amber-400/45 bg-gradient-to-b from-amber-400/10 to-card px-3 py-3",
      )}
    >
      <CupTieRowSide
        person={tie.personOne}
        feeders={tie.feederOne}
        legs={view.legsOne}
        total={view.totalOne}
        toPlay={view.toPlayOne}
        isWinner={isDecided && tie.winner === tie.personOne}
        isDecided={isDecided}
        isFinal={isFinal}
        isMirrored={false}
        totalDigits={totalDigits}
      />

      <span
        className={cn(
          "shrink-0 font-bold text-[10px] text-muted-foreground uppercase tracking-wider",
          isFinal && "text-xs",
        )}
      >
        v
      </span>

      <CupTieRowSide
        person={tie.personTwo}
        feeders={tie.feederTwo}
        legs={view.legsTwo}
        total={view.totalTwo}
        toPlay={view.toPlayTwo}
        isWinner={isDecided && tie.winner === tie.personTwo}
        isDecided={isDecided}
        isFinal={isFinal}
        isMirrored
        totalDigits={totalDigits}
      />
    </div>
  )
}
