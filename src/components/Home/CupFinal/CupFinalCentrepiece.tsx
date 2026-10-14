import { CupFinalStars } from "@pbd/components/Home/CupFinal/CupFinalStars"
import { CupFinalTrophy } from "@pbd/components/Home/CupFinal/CupFinalTrophy"
import { cn } from "@pbd/lib/className"
import { CUP_NO_SCORE } from "@pbd/lib/constants/Cups"
import type { CupTieView } from "@pbd/lib/cups/live"
import { cupFinalBodyFont } from "@pbd/lib/fonts"
import { padGameweek } from "@pbd/lib/home/homeScreen"
import type { CupTie, CupTieStatus } from "@pbd/types/cups.types"
import type { JSX } from "react"

type Props = {
  tie: CupTie | null
  view: CupTieView | null
  notice: string | null
}

const STATUS_COPY: Record<CupTieStatus, string> = {
  pending: "Finalists to be decided",
  scheduled: "Kick-off",
  live: "Live",
  settled: "Full time",
}

const SCORE_CLASSES =
  "min-w-11 px-2.5 py-1 text-center text-[32px] font-extrabold leading-none tabular-nums"

const statusLine = (tie: CupTie | null, notice: string | null): string | null => {
  if (!tie) return notice

  const kickOff = tie.legs[0]?.gameweek
  if (tie.status === "scheduled" && kickOff !== undefined)
    return `${STATUS_COPY.scheduled} GW${padGameweek(kickOff)}`

  return STATUS_COPY[tie.status]
}

export const CupFinalCentrepiece = ({ tie, view, notice }: Props): JSX.Element => {
  const status = statusLine(tie, notice)

  return (
    <div className="flex w-36 flex-col items-center">
      <div className="relative flex size-36 items-center justify-center">
        <span
          aria-hidden
          className="cupfinal-halo absolute -inset-3 rounded-full motion-safe:animate-cupfinal-glow"
        />
        <CupFinalStars className="absolute inset-0 motion-safe:animate-cupfinal-orbit" />
        <CupFinalTrophy className="relative h-24 drop-shadow-[0_8px_16px_var(--color-cupfinal-midnight)]" />
      </div>
      <div
        className={cn(
          cupFinalBodyFont.className,
          "cupfinal-plate -mt-2 flex items-center rounded-lg text-cupfinal-midnight",
        )}
      >
        <span className={SCORE_CLASSES}>{view?.totalOne ?? CUP_NO_SCORE}</span>
        <span aria-hidden className="h-7 w-px bg-cupfinal-steel" />
        <span className={SCORE_CLASSES}>{view?.totalTwo ?? CUP_NO_SCORE}</span>
      </div>
      {status && (
        <p
          className={cn(
            cupFinalBodyFont.className,
            "mt-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-cupfinal-silver",
          )}
        >
          {tie?.status === "live" && (
            <span
              aria-hidden
              className="size-2 rounded-full bg-cupfinal-live shadow-[0_0_8px_var(--color-cupfinal-live)] motion-safe:animate-pulse"
            />
          )}
          {status}
        </p>
      )}
    </div>
  )
}
