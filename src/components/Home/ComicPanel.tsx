import { HomeFace } from "@pbd/components/Home/HomeFace"
import { HomeFitBox } from "@pbd/components/Home/HomeFitBox"
import { PitchSurface } from "@pbd/components/Pitch/PitchSurface"
import { useLoserLineup } from "@pbd/hooks/fpl/useLoserLineup"
import { HOME_PITCH_DESIGN_WIDTH } from "@pbd/lib/constants/Home"
import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import { comicFont } from "@pbd/lib/fonts"
import { forfeitStatusCopy } from "@pbd/lib/homeScreen"
import { cn } from "@pbd/lib/utils/cn"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { HomeLeagueSnapshot } from "@pbd/types/home.types"
import Link from "next/link"
import type { JSX } from "react"

type Tone = "red" | "sky"

type Props = {
  league: LeagueSlug
  snapshot: HomeLeagueSnapshot
  tone: Tone
  burst: string
}

const TONE_CLASSES: Record<Tone, string> = {
  red: "-rotate-3 bg-comic-red",
  sky: "rotate-3 bg-comic-sky",
}

const BUBBLE_CLASSES = `${comicFont.className} relative flex w-full shrink-0 items-center justify-center rounded-2xl border-[3px] border-black bg-comic-cream px-2 py-2 text-center text-base uppercase leading-tight tracking-wide text-black`

const BUBBLE_TAIL_CLASSES =
  "absolute -top-[13px] left-1/2 h-0 w-0 -translate-x-1/2 border-x-[9px] border-b-[13px] border-x-transparent border-b-black"

export const ComicPanel = ({ league, snapshot, tone, burst }: Props): JSX.Element => {
  const lineup = useLoserLineup(snapshot.loser?.apiId ?? null)
  const copy = forfeitStatusCopy(snapshot.forfeit)
  const bubble = (
    <>
      <span aria-hidden className={BUBBLE_TAIL_CLASSES} />
      {copy.headline}!
    </>
  )

  return (
    <article
      className={cn(
        "comic-shadow halftone relative flex min-h-0 flex-col items-center gap-2 border-4 border-black px-2.5 pb-3 pt-3 text-center text-comic-cream outline-[3px] outline-comic-cream -outline-offset-[9px]",
        TONE_CLASSES[tone],
      )}
    >
      <span className="comic-shadow-sm self-start -rotate-3 border-[3px] border-black bg-comic-cream px-2 py-0.5 text-[9px] font-black uppercase text-black">
        {LEAGUE_LABELS[league]}
      </span>
      <div className="flex min-h-0 flex-col items-center justify-center gap-1">
        <HomeFace
          person={snapshot.loser}
          className={cn("rotate-3 border-black text-black", "lg:h-24 lg:w-24")}
        />
        <h2
          className={`${comicFont.className} comic-outline mt-1 text-3xl uppercase leading-none tracking-wide`}
        >
          {snapshot.loser?.name ?? "TBC"}!
        </h2>
        <p className="text-[11px] font-black uppercase tabular-nums text-black">
          {fmtPts(snapshot.loser?.points)} pts
        </p>
      </div>
      {lineup && (
        <HomeFitBox designWidth={HOME_PITCH_DESIGN_WIDTH}>
          <PitchSurface rows={lineup} />
        </HomeFitBox>
      )}
      {copy.href ? (
        <Link href={copy.href} className={BUBBLE_CLASSES}>
          {bubble}
        </Link>
      ) : (
        <div className={BUBBLE_CLASSES}>{bubble}</div>
      )}
      <span className="comic-burst absolute -right-3 -top-4 flex h-16 w-16 rotate-12 items-center justify-center bg-black">
        <span
          className={`${comicFont.className} comic-burst flex h-[calc(100%-6px)] w-[calc(100%-6px)] items-center justify-center bg-comic-yellow text-lg text-black`}
        >
          {burst}
        </span>
      </span>
    </article>
  )
}
