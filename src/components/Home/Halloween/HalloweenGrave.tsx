"use client"

import { HalloweenGhost } from "@pbd/components/Home/Halloween/HalloweenGhost"
import { HalloweenPumpkin } from "@pbd/components/Home/Halloween/HalloweenPumpkin"
import { HomeFace } from "@pbd/components/Home/HomeFace"
import { HomeFitBox } from "@pbd/components/Home/HomeFitBox"
import { PitchSurface } from "@pbd/components/Pitch/PitchSurface"
import { useLoserLineup } from "@pbd/hooks/fpl/useLoserLineup"
import { cn } from "@pbd/lib/className"
import { LEAGUE_LABELS } from "@pbd/lib/constants/Fpl"
import type { LeagueSlug } from "@pbd/lib/constants/Fpl"
import { HOME_PITCH_DESIGN_WIDTH } from "@pbd/lib/constants/Home"
import { halloweenBodyFont, halloweenTitleFont } from "@pbd/lib/fonts"
import { fmtPts } from "@pbd/lib/format"
import { forfeitStatusCopy } from "@pbd/lib/home/homeScreen"
import type { HomeLeagueSnapshot } from "@pbd/types/home.types"
import Link from "next/link"
import type { JSX } from "react"

type Side = "left" | "right"

type Props = {
  league: LeagueSlug
  snapshot: HomeLeagueSnapshot
  side: Side
}

const UNNAMED = "TBC"

const GHOST_CLASSES: Record<Side, string> = {
  left: "-left-4 -top-6 -rotate-12",
  right: "-right-4 -top-6 rotate-12",
}

const PUMPKIN_CLASSES: Record<Side, string> = {
  left: "-bottom-3 -left-3",
  right: "-bottom-3 -right-3",
}

const STATUS_CLASSES =
  "line-clamp-2 text-[10px] font-black uppercase leading-tight tracking-wider text-halloween-candle"

export const HalloweenGrave = ({ league, snapshot, side }: Props): JSX.Element => {
  const lineup = useLoserLineup(snapshot.loser?.apiId ?? null)
  const copy = forfeitStatusCopy(snapshot.forfeit)
  const headline = <>&#10022; {copy.headline}</>

  return (
    <div className="relative flex min-h-0 flex-col">
      <HalloweenGhost
        className={cn(
          "absolute w-12 drop-shadow-[0_0_8px_var(--color-halloween-bone)] motion-safe:animate-halloween-float",
          GHOST_CLASSES[side],
        )}
      />
      <article className="halloween-tombstone relative flex min-h-0 flex-1 flex-col items-center gap-1 px-3 pb-7 pt-4 text-center">
        <span
          className={cn(
            halloweenTitleFont.className,
            "halloween-glow text-2xl leading-none tracking-widest text-halloween-pumpkin",
          )}
        >
          R.I.P.
        </span>
        <span className="text-[8px] font-black uppercase tracking-[0.25em] text-halloween-bone/70">
          {LEAGUE_LABELS[league]}
        </span>
        <HomeFace
          person={snapshot.loser}
          className="mt-1 h-14 w-14 border-halloween-pumpkin text-halloween-bone shadow-[0_0_14px_var(--color-halloween-pumpkin)]"
        />
        <strong
          className={cn(
            halloweenBodyFont.className,
            "max-w-full truncate text-[22px] font-normal leading-normal text-halloween-bone",
          )}
        >
          {snapshot.loser?.name ?? UNNAMED}
        </strong>
        <span className="text-[9px] font-bold uppercase tracking-wider text-halloween-bone/70">
          {fmtPts(snapshot.loser?.points)} pts &middot; {snapshot.loser?.goals ?? 0}G &middot;{" "}
          {snapshot.loser?.assists ?? 0}A
        </span>
        {lineup && (
          <HomeFitBox designWidth={HOME_PITCH_DESIGN_WIDTH}>
            <PitchSurface
              rows={lineup}
              className="halloween-turf rounded-lg border-2 border-halloween-night"
            />
          </HomeFitBox>
        )}
        <div className="w-full shrink-0">
          {copy.href ? (
            <Link href={copy.href} className={cn(STATUS_CLASSES, "underline")}>
              {headline}
            </Link>
          ) : (
            <p className={STATUS_CLASSES}>{headline}</p>
          )}
          <p className="text-[8px] italic text-halloween-bone/60">{copy.detail}</p>
        </div>
      </article>
      <HalloweenPumpkin className={cn("absolute z-30 w-12", PUMPKIN_CLASSES[side])} />
    </div>
  )
}
