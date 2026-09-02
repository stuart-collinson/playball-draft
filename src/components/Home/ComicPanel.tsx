import { HomeFace } from "@pbd/components/Home/HomeFace"
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
  red: "-rotate-2 bg-comic-red",
  sky: "rotate-2 bg-comic-sky",
}

const CAPTION_CLASSES =
  "flex w-full shrink-0 -rotate-1 items-center justify-center border-[3px] border-black bg-black px-2 py-2 text-center text-[11px] font-black uppercase leading-tight text-comic-yellow"

export const ComicPanel = ({ league, snapshot, tone, burst }: Props): JSX.Element => {
  const copy = forfeitStatusCopy(snapshot.forfeit)

  return (
    <article
      className={cn(
        "comic-shadow halftone relative flex min-h-0 flex-col items-center gap-1 border-4 border-black px-2.5 pb-3 pt-2.5 text-center text-comic-cream",
        TONE_CLASSES[tone],
      )}
    >
      <p className="w-full whitespace-nowrap border-b-2 border-black pb-1.5 pr-11 text-left text-[8px] font-black uppercase text-black">
        {LEAGUE_LABELS[league]} loser
      </p>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1">
        <HomeFace person={snapshot.loser} className="border-black text-black" />
        <h2
          className={`${comicFont.className} comic-outline mt-1 text-3xl uppercase leading-none tracking-wide`}
        >
          {snapshot.loser?.name ?? "TBC"}!
        </h2>
        <p className="text-[11px] font-black uppercase tabular-nums text-black">
          {fmtPts(snapshot.loser?.points)} pts
        </p>
      </div>
      {copy.href ? (
        <Link href={copy.href} className={CAPTION_CLASSES}>
          {copy.headline}
        </Link>
      ) : (
        <div className={CAPTION_CLASSES}>{copy.headline}</div>
      )}
      <span
        aria-hidden
        className={`${comicFont.className} comic-burst absolute -right-2 -top-3 flex h-14 w-14 rotate-12 items-center justify-center bg-comic-yellow text-lg text-black`}
      >
        {burst}
      </span>
    </article>
  )
}
