"use client"

import { EasterBunny } from "@pbd/components/Home/Easter/EasterBunny"
import { EasterChick } from "@pbd/components/Home/Easter/EasterChick"
import { HomeFace } from "@pbd/components/Home/HomeFace"
import { HomeFitBox } from "@pbd/components/Home/HomeFitBox"
import { HomeForfeitStatus } from "@pbd/components/Home/HomeForfeitStatus"
import { PitchSurface } from "@pbd/components/Pitch/PitchSurface"
import { useLoserLineup } from "@pbd/hooks/fpl/useLoserLineup"
import { cn } from "@pbd/lib/className"
import { LEAGUE_LABELS } from "@pbd/lib/constants/Fpl"
import type { LeagueSlug } from "@pbd/lib/constants/Fpl"
import { HOME_NAME_PLACEHOLDER, HOME_PITCH_DESIGN_WIDTH } from "@pbd/lib/constants/Home"
import { easterBodyFont, easterTitleFont } from "@pbd/lib/fonts"
import { loserStatLine } from "@pbd/lib/home/homeScreen"
import type { HomeLeagueSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Side = "left" | "right"

type Props = {
  league: LeagueSlug
  snapshot: HomeLeagueSnapshot
  side: Side
}

const SHELL_CLASSES: Record<Side, string> = {
  left: "border-easter-pink",
  right: "border-easter-mint",
}

const BUNNY_CLASSES: Record<Side, string> = {
  left: "-left-2 -top-8 -rotate-12",
  right: "-right-2 -top-8 rotate-12",
}

const CHICK_CLASSES: Record<Side, string> = {
  left: "-bottom-2 -left-3",
  right: "-bottom-2 -right-3",
}

export const EasterBadEgg = ({ league, snapshot, side }: Props): JSX.Element => {
  const lineup = useLoserLineup(snapshot.loser?.apiId ?? null)

  return (
    <div className="relative mx-auto flex min-h-0 w-full max-w-72 flex-col">
      <EasterBunny className={cn("absolute w-12 motion-safe:animate-float", BUNNY_CLASSES[side])} />
      <article
        className={cn(
          "easter-egg-card relative flex min-h-0 flex-1 flex-col items-center gap-1 border-[5px] px-5 pb-9 pt-7 text-center text-easter-ink",
          SHELL_CLASSES[side],
        )}
      >
        <span
          className={cn(
            easterTitleFont.className,
            "text-[24px] leading-none text-easter-lilac-deep",
          )}
        >
          Cracked!
        </span>
        <span className="text-[8px] font-black uppercase tracking-[0.25em] text-easter-ink/70">
          {LEAGUE_LABELS[league]}
        </span>
        <HomeFace
          person={snapshot.loser}
          className="mt-1 h-14 w-14 border-easter-lilac text-easter-ink"
        />
        <strong
          className={cn(
            easterBodyFont.className,
            "max-w-full truncate text-[22px] font-semibold leading-normal",
          )}
        >
          {snapshot.loser?.name ?? HOME_NAME_PLACEHOLDER}
        </strong>
        <span className="text-[9px] font-bold uppercase tracking-wider text-easter-ink/70">
          {loserStatLine(snapshot.loser)}
        </span>
        {lineup && (
          <HomeFitBox designWidth={HOME_PITCH_DESIGN_WIDTH}>
            <PitchSurface rows={lineup} className="rounded-lg border-2 border-easter-grass-deep" />
          </HomeFitBox>
        )}
        <HomeForfeitStatus
          status={snapshot.forfeit}
          headlineClassName="text-easter-lilac-deep"
          detailClassName="text-easter-ink/60"
        />
      </article>
      <EasterChick
        className={cn("absolute z-30 w-11 motion-safe:animate-easter-hop", CHICK_CLASSES[side])}
      />
    </div>
  )
}
