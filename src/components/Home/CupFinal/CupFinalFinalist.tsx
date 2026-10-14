import { PersonFace } from "@pbd/components/PersonFace/PersonFace"
import { cn } from "@pbd/lib/className"
import { LEAGUE_LABELS } from "@pbd/lib/constants/Fpl"
import { HOME_NAME_PLACEHOLDER } from "@pbd/lib/constants/Home"
import { cupFinalBodyFont } from "@pbd/lib/fonts"
import { participantLabelForSlug, participantLeagueForSlug } from "@pbd/lib/people"
import type { CupFinalSide } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  person: string | null
  toPlay: number | null
  winner: string | null
  side: CupFinalSide
}

const FACE_CLASSES: Record<CupFinalSide, string> = {
  one: "ring-cupfinal-silver shadow-[0_0_22px_var(--color-cupfinal-silver)]",
  two: "ring-cupfinal-electric shadow-[0_0_22px_var(--color-cupfinal-electric)]",
}

const KIT_CLASSES: Record<CupFinalSide, string> = {
  one: "bg-cupfinal-silver",
  two: "bg-cupfinal-electric",
}

const ALL_PLAYED = "All played"

const caption = (person: string | null, toPlay: number | null): string => {
  if (toPlay === 0) return ALL_PLAYED
  if (toPlay !== null) return `${toPlay} to play`
  const league = person ? participantLeagueForSlug(person) : null

  return league ? LEAGUE_LABELS[league] : ""
}

export const CupFinalFinalist = ({ person, toPlay, winner, side }: Props): JSX.Element => {
  const isChampion = person !== null && winner === person
  const isRunnerUp = winner !== null && !isChampion

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center gap-1.5 pt-6 text-center",
        isRunnerUp && "opacity-60 grayscale",
      )}
    >
      {person ? (
        <PersonFace
          slug={person}
          className={cn("size-16 border-0 ring-[3px]", FACE_CLASSES[side])}
        />
      ) : (
        <span className="size-16 rounded-full border-2 border-dashed border-cupfinal-steel/60" />
      )}
      <strong
        className={cn(
          cupFinalBodyFont.className,
          "mt-1 max-w-full truncate text-[22px] font-extrabold uppercase leading-none tracking-wide text-cupfinal-shine",
        )}
      >
        {person ? participantLabelForSlug(person) : HOME_NAME_PLACEHOLDER}
      </strong>
      <span aria-hidden className={cn("h-0.5 w-8 rounded-full", KIT_CLASSES[side])} />
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-cupfinal-steel">
        {caption(person, toPlay)}
      </span>
      {isChampion && (
        <span className="cupfinal-plate rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.25em] text-cupfinal-midnight">
          Champions
        </span>
      )}
    </div>
  )
}
