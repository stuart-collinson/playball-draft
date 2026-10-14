"use client"

import { ChristmasCoal } from "@pbd/components/Home/Christmas/ChristmasCoal"
import { ChristmasSnowman } from "@pbd/components/Home/Christmas/ChristmasSnowman"
import { HomeFace } from "@pbd/components/Home/HomeFace"
import { HomeFitBox } from "@pbd/components/Home/HomeFitBox"
import { HomeForfeitStatus } from "@pbd/components/Home/HomeForfeitStatus"
import { PitchSurface } from "@pbd/components/Pitch/PitchSurface"
import { useStarterLineup } from "@pbd/hooks/fpl/useStarterLineup"
import { cn } from "@pbd/lib/className"
import { LEAGUE_LABELS } from "@pbd/lib/constants/Fpl"
import type { LeagueSlug } from "@pbd/lib/constants/Fpl"
import { HOME_NAME_PLACEHOLDER, HOME_PITCH_DESIGN_WIDTH } from "@pbd/lib/constants/Home"
import { christmasBodyFont, christmasTitleFont } from "@pbd/lib/fonts"
import { loserStatLine } from "@pbd/lib/home/homeScreen"
import type { HomeLeagueSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Side = "left" | "right"

type Props = {
  league: LeagueSlug
  snapshot: HomeLeagueSnapshot
  side: Side
}

const SNOWMAN_CLASSES: Record<Side, string> = {
  left: "-left-4 -top-9 -rotate-6",
  right: "-right-4 -top-9 rotate-6",
}

const COAL_CLASSES: Record<Side, string> = {
  left: "-bottom-1 -left-2",
  right: "-bottom-1 -right-2",
}

const SEAL_CLASSES: Record<Side, string> = {
  left: "-left-2.5 top-16 -rotate-12",
  right: "-right-2.5 top-16 rotate-12",
}

const ROLL_CLASSES = "christmas-scroll-roll relative z-10 -mx-1.5 h-4 shrink-0"

export const ChristmasScroll = ({ league, snapshot, side }: Props): JSX.Element => {
  const lineup = useStarterLineup(snapshot.loser?.apiId ?? null)

  return (
    <div className="relative flex min-h-0 flex-col">
      <ChristmasSnowman
        className={cn("absolute w-12 motion-safe:animate-float", SNOWMAN_CLASSES[side])}
      />
      <article className="relative flex min-h-0 flex-1 flex-col">
        <span aria-hidden className={ROLL_CLASSES} />
        <div className="christmas-parchment flex min-h-0 flex-1 flex-col items-center gap-1 px-3 pb-6 pt-2 text-center text-christmas-ink">
          <span
            className={cn(
              christmasTitleFont.className,
              "text-[26px] font-bold leading-none text-christmas-berry",
            )}
          >
            Naughty!
          </span>
          <span className="text-[8px] font-black uppercase tracking-[0.25em] text-christmas-ink/70">
            {LEAGUE_LABELS[league]}
          </span>
          <HomeFace
            person={snapshot.loser}
            className="mt-1 h-14 w-14 border-christmas-berry text-christmas-ink"
          />
          <strong
            className={cn(
              christmasBodyFont.className,
              "max-w-full truncate text-[22px] font-normal leading-normal",
            )}
          >
            {snapshot.loser?.name ?? HOME_NAME_PLACEHOLDER}
          </strong>
          <span className="text-[9px] font-bold uppercase tracking-wider text-christmas-ink/70">
            {loserStatLine(snapshot.loser)}
          </span>
          {lineup && (
            <HomeFitBox designWidth={HOME_PITCH_DESIGN_WIDTH}>
              <PitchSurface
                rows={lineup}
                className="christmas-turf rounded-lg border-2 border-christmas-pine-deep"
              />
            </HomeFitBox>
          )}
          <HomeForfeitStatus
            status={snapshot.forfeit}
            headlineClassName="text-christmas-berry"
            detailClassName="text-christmas-ink/60"
          />
        </div>
        <span aria-hidden className={ROLL_CLASSES} />
        <span
          aria-hidden
          className={cn(
            christmasTitleFont.className,
            "christmas-seal absolute flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-christmas-snow",
            SEAL_CLASSES[side],
          )}
        >
          N
        </span>
      </article>
      <ChristmasCoal className={cn("absolute z-30 w-12", COAL_CLASSES[side])} />
    </div>
  )
}
