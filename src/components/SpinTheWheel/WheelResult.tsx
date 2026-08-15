import type { JSX } from "react"

type WheelResultProps = {
  spinning: boolean
  winnerLabel: string | null
}

export const WheelResult = ({ spinning, winnerLabel }: WheelResultProps): JSX.Element => (
  <div className="w-full rounded-2xl border border-border bg-card px-6 py-4 text-center">
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
      {spinning ? "Spinning" : "Your challenge"}
    </p>
    <div aria-live="polite" className="mt-1 text-lg font-bold text-foreground">
      {winnerLabel ? `You got: ${winnerLabel}` : ""}
    </div>
    {!winnerLabel && (
      <p className="mt-1 text-sm text-muted-foreground">
        {spinning ? "Round and round…" : "Hit spin to draw your challenge"}
      </p>
    )}
  </div>
)
