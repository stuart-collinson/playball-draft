"use client"

import { CupFinalHalf } from "@pbd/components/Home/CupFinal/CupFinalHalf"
import { CupFinalPitchMarkings } from "@pbd/components/Home/CupFinal/CupFinalPitchMarkings"
import { useStarterLineup } from "@pbd/hooks/fpl/useStarterLineup"
import { cn } from "@pbd/lib/className"
import { cupFinalBodyFont } from "@pbd/lib/fonts"
import { participantApiIdForSlug } from "@pbd/lib/people"
import type { JSX } from "react"

type Props = {
  personOne: string | null
  personTwo: string | null
  lineupGameweek: number
  showPoints: boolean
}

const CONFIRMED_LABEL = "Line-ups"

const PROBABLE_LABEL = "Probable line-ups"

const apiIdFor = (person: string | null): number | null =>
  person === null ? null : participantApiIdForSlug(person)

export const CupFinalPitch = ({
  personOne,
  personTwo,
  lineupGameweek,
  showPoints,
}: Props): JSX.Element => {
  const lineupOne = useStarterLineup(apiIdFor(personOne), lineupGameweek)
  const lineupTwo = useStarterLineup(apiIdFor(personTwo), lineupGameweek)

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <span
        className={cn(
          cupFinalBodyFont.className,
          "absolute -top-2 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-cupfinal-midnight px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.3em] text-cupfinal-electric ring-1 ring-cupfinal-electric/50",
        )}
      >
        {showPoints ? CONFIRMED_LABEL : PROBABLE_LABEL}
      </span>
      <div className="cupfinal-turf relative flex min-h-48 flex-1 overflow-hidden rounded-xl">
        <CupFinalPitchMarkings />
        <CupFinalHalf rows={lineupOne} side="one" showPoints={showPoints} />
        <CupFinalHalf
          rows={lineupTwo ? [...lineupTwo].reverse() : null}
          side="two"
          showPoints={showPoints}
        />
      </div>
    </div>
  )
}
