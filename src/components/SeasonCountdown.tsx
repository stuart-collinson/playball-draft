"use client"

import { useCountdown } from "@pbd/hooks/useCountdown"
import { hasElapsed } from "@pbd/lib/countdown"
import type { Countdown } from "@pbd/lib/countdown"
import type { JSX } from "react"

type Props = {
  deadline: string | null
  gameweek: number | null
}

const UNIT_LABELS: { key: keyof Countdown; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hrs" },
  { key: "minutes", label: "Mins" },
  { key: "seconds", label: "Secs" },
]

const pad = (value: number): string => String(value).padStart(2, "0")

const CountdownUnit = ({ value, label }: { value: string; label: string }): JSX.Element => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-2xl font-black tabular-nums text-foreground sm:text-3xl">{value}</span>
    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {label}
    </span>
  </div>
)

export const SeasonCountdown = ({ deadline, gameweek }: Props): JSX.Element => {
  const countdown = useCountdown(deadline)
  const kickingOff = countdown !== null && hasElapsed(countdown)
  const preSeason = gameweek === null

  const heading = kickingOff
    ? "Kicking Off"
    : preSeason
      ? "Season Starting"
      : `Gameweek ${gameweek}`

  const message = preSeason
    ? "No scores yet — the table fills in once Gameweek 1 kicks off."
    : `No scores yet — Gameweek ${gameweek} results appear once the matches start.`

  return (
    <div className="animate-fade-up-delay-2 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
          {heading}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-prem-500/30 to-champ-500/30" />
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/50 bg-muted/30 px-4 py-8">
        {deadline !== null && (
          <div className="flex items-start gap-4 sm:gap-6">
            {countdown === null ? (
              <div className="h-12 w-48 animate-pulse rounded-lg bg-muted" />
            ) : (
              UNIT_LABELS.map(({ key, label }) => (
                <CountdownUnit key={key} value={pad(countdown[key])} label={label} />
              ))
            )}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          {kickingOff ? "First scores land shortly after kick-off." : message}
        </p>
      </div>
    </div>
  )
}
