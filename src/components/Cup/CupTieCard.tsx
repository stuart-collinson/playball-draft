import { CupTieSide } from "@pbd/components/Cup/CupTieSide"
import { cn } from "@pbd/lib/className"
import { cupTieView } from "@pbd/lib/cups/live"
import type { CupLive } from "@pbd/lib/cups/live"
import type { CupTie } from "@pbd/types/cups.types"
import type { JSX } from "react"

type Props = {
  tie: CupTie
  live: CupLive | null
  isFinal: boolean
}

export const CupTieCard = ({ tie, live, isFinal }: Props): JSX.Element => {
  const view = cupTieView(tie, live)
  const isDecided = tie.winner !== null

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card",
        tie.status === "live" && "border-primary/50 ring-1 ring-primary/20",
        isFinal &&
          "rounded-2xl border-amber-400/45 bg-gradient-to-b from-amber-400/10 to-card shadow-amber-400/30 shadow-lg",
        isFinal && tie.status === "live" && "border-amber-400/45 ring-0",
      )}
    >
      <CupTieSide
        person={tie.personOne}
        feeders={tie.feederOne}
        legs={view.legsOne}
        total={view.totalOne}
        toPlay={view.toPlayOne}
        isWinner={isDecided && tie.winner === tie.personOne}
        isDecided={isDecided}
        isFinal={isFinal}
      />
      <div aria-hidden className={cn("h-px bg-border", isFinal && "bg-amber-400/25")} />
      <CupTieSide
        person={tie.personTwo}
        feeders={tie.feederTwo}
        legs={view.legsTwo}
        total={view.totalTwo}
        toPlay={view.toPlayTwo}
        isWinner={isDecided && tie.winner === tie.personTwo}
        isDecided={isDecided}
        isFinal={isFinal}
      />
    </div>
  )
}
