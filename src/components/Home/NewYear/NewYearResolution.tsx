"use client"

import { HomeFace } from "@pbd/components/Home/HomeFace"
import { HomeFitBox } from "@pbd/components/Home/HomeFitBox"
import { HomeForfeitStatus } from "@pbd/components/Home/HomeForfeitStatus"
import { NewYearBottle } from "@pbd/components/Home/NewYear/NewYearBottle"
import { NewYearPartyHat } from "@pbd/components/Home/NewYear/NewYearPartyHat"
import { PitchSurface } from "@pbd/components/Pitch/PitchSurface"
import { useStarterLineup } from "@pbd/hooks/fpl/useStarterLineup"
import { cn } from "@pbd/lib/className"
import { LEAGUE_LABELS } from "@pbd/lib/constants/Fpl"
import type { LeagueSlug } from "@pbd/lib/constants/Fpl"
import { HOME_NAME_PLACEHOLDER, HOME_PITCH_DESIGN_WIDTH } from "@pbd/lib/constants/Home"
import { newYearBodyFont, newYearTitleFont } from "@pbd/lib/fonts"
import { loserStatLine } from "@pbd/lib/home/homeScreen"
import type { HomeLeagueSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Side = "left" | "right"

type Props = {
  league: LeagueSlug
  snapshot: HomeLeagueSnapshot
  side: Side
}

const RESOLUTION = "Stop finishing last"

const HAT_CLASSES: Record<Side, string> = {
  left: "-left-3 -top-7 -rotate-[24deg]",
  right: "-right-3 -top-7 rotate-[24deg]",
}

const BOTTLE_CLASSES: Record<Side, string> = {
  left: "-bottom-2 -left-3",
  right: "-bottom-2 -right-3 -scale-x-100",
}

export const NewYearResolution = ({ league, snapshot, side }: Props): JSX.Element => {
  const lineup = useStarterLineup(snapshot.loser?.apiId ?? null)

  return (
    <div className="relative flex min-h-0 flex-col">
      <NewYearPartyHat
        className={cn("absolute w-10 motion-safe:animate-float", HAT_CLASSES[side])}
      />
      <article className="newyear-deco-card relative flex min-h-0 flex-1 flex-col items-center gap-1 px-4 pb-9 pt-4 text-center text-newyear-fizz">
        <span
          className={cn(newYearTitleFont.className, "text-[20px] leading-none text-newyear-gold")}
        >
          Resolution:
        </span>
        <span className="text-[8px] font-black uppercase tracking-[0.22em] text-newyear-silver">
          {RESOLUTION}
        </span>
        <span className="text-[8px] font-black uppercase tracking-[0.25em] text-newyear-cyan">
          {LEAGUE_LABELS[league]}
        </span>
        <HomeFace
          person={snapshot.loser}
          className="mt-1 h-14 w-14 border-newyear-gold text-newyear-fizz shadow-[0_0_14px_var(--color-newyear-gold)]"
        />
        <strong
          className={cn(
            newYearBodyFont.className,
            "max-w-full truncate text-[22px] font-bold leading-normal",
          )}
        >
          {snapshot.loser?.name ?? HOME_NAME_PLACEHOLDER}
        </strong>
        <span className="text-[9px] font-bold uppercase tracking-wider text-newyear-silver">
          {loserStatLine(snapshot.loser)}
        </span>
        {lineup && (
          <HomeFitBox designWidth={HOME_PITCH_DESIGN_WIDTH}>
            <PitchSurface
              rows={lineup}
              className="newyear-turf rounded-lg border-2 border-newyear-gold-deep"
            />
          </HomeFitBox>
        )}
        <HomeForfeitStatus
          status={snapshot.forfeit}
          headlineClassName="text-newyear-gold"
          detailClassName="text-newyear-silver/80"
        />
      </article>
      <NewYearBottle className={cn("absolute z-30 w-10", BOTTLE_CLASSES[side])} />
    </div>
  )
}
