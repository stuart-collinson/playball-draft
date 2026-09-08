"use client"

import { HomeFace } from "@pbd/components/Home/HomeFace"
import { HomeFitBox } from "@pbd/components/Home/HomeFitBox"
import { PitchSurface } from "@pbd/components/Pitch/PitchSurface"
import { useLoserLineup } from "@pbd/hooks/fpl/useLoserLineup"
import { HOME_PITCH_DESIGN_WIDTH } from "@pbd/lib/constants/Home"
import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import { newspaperBodyFont, newspaperHeadlineFont } from "@pbd/lib/fonts"
import { forfeitStatusCopy } from "@pbd/lib/homeScreen"
import { cn } from "@pbd/lib/utils/cn"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { HomeLeagueSnapshot } from "@pbd/types/home.types"
import Link from "next/link"
import type { CSSProperties, JSX } from "react"
import { useState } from "react"

type Props = {
  league: LeagueSlug
  snapshot: HomeLeagueSnapshot
}

const UNNAMED = "TBC"

const BYLINES: Record<LeagueSlug, string> = {
  premiership: "Reported by Fabrizio Romano",
  championship: "Reported by David Ornstein",
}

const CAPTIONS: Record<LeagueSlug, (name: string) => string> = {
  premiership: (name) => `Above: the eleven who abandoned ${name} in his hour of need.`,
  championship: (name) => `Above: ${name}'s chosen eleven, pictured mid-collapse.`,
}

const STATUS_CLASSES = "text-[10.5px] font-bold uppercase tracking-[0.06em] text-newsprint-ink"

export const NewspaperColumn = ({ league, snapshot }: Props): JSX.Element => {
  const lineup = useLoserLineup(snapshot.loser?.apiId ?? null)
  const [photoWidth, setPhotoWidth] = useState<number | null>(null)
  const copy = forfeitStatusCopy(snapshot.forfeit)
  const name = snapshot.loser?.name ?? UNNAMED
  const alignToPhoto: CSSProperties | undefined =
    photoWidth === null ? undefined : { maxWidth: photoWidth }

  return (
    <article className="flex min-h-0 flex-col gap-1.5 px-2.5 first:pl-0 last:pr-0">
      <h2 className="shrink-0 border-y border-newsprint-ink py-0.5 text-center text-[9px] font-bold uppercase tracking-[0.22em]">
        {LEAGUE_LABELS[league]}
      </h2>
      <p className="shrink-0 text-center text-[8px] uppercase tracking-[0.14em] text-newsprint-muted">
        {BYLINES[league]}
      </p>

      <div className="flex shrink-0 items-center justify-center gap-2">
        <span className="relative shrink-0">
          <HomeFace
            person={snapshot.loser}
            className="h-14 w-14 rounded-none border-2 border-newsprint-ink bg-newsprint-shade text-newsprint-ink grayscale contrast-[1.15]"
          />
          <span aria-hidden className="halftone pointer-events-none absolute inset-0" />
        </span>
        <span className="min-w-0">
          <strong
            className={cn(
              newspaperHeadlineFont.className,
              "block truncate text-[23px] font-bold uppercase leading-none tracking-[-0.01em]",
            )}
          >
            {name}
          </strong>
          <span className="mt-1 block text-[8.5px] uppercase tracking-[0.14em] text-newsprint-muted">
            {fmtPts(snapshot.loser?.points)}Pts - {snapshot.loser?.goals ?? 0}G and{" "}
            {snapshot.loser?.assists ?? 0}A
          </span>
        </span>
      </div>

      {lineup && (
        <HomeFitBox designWidth={HOME_PITCH_DESIGN_WIDTH} onContentWidth={setPhotoWidth}>
          <PitchSurface rows={lineup} className="rounded-none border-2 border-newsprint-ink" />
        </HomeFitBox>
      )}

      <div className="mx-auto w-full shrink-0" style={alignToPhoto}>
        <p
          className={cn(
            newspaperBodyFont.className,
            "border-b border-dotted border-newsprint-muted pb-1 text-[8.5px] italic leading-snug text-newsprint-muted",
          )}
        >
          {CAPTIONS[league](name)}
        </p>
        {copy.href ? (
          <Link href={copy.href} className={cn(STATUS_CLASSES, "mt-1.5 block underline")}>
            &#9656; {copy.headline}
          </Link>
        ) : (
          <p className={cn(STATUS_CLASSES, "mt-1.5")}>&#9656; {copy.headline}</p>
        )}
        <p className="text-[8px] italic leading-snug text-newsprint-muted">{copy.detail}</p>
      </div>
    </article>
  )
}
