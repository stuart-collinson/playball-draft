import { HomeFace } from "@pbd/components/Home/HomeFace"
import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import type { LeagueSlug } from "@pbd/lib/constants/fpl"
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

const CAPTION_CLASSES = "mt-2 flex w-full -rotate-1 flex-col gap-0.5 bg-comic-navy px-2 py-2"

export const ComicPanel = ({ league, snapshot, tone, burst }: Props): JSX.Element => {
  const copy = forfeitStatusCopy(snapshot.forfeit)
  const caption = (
    <>
      <span className="text-[11px] font-black uppercase leading-tight text-comic-cream">
        {copy.headline}
      </span>
      <span className="text-[8px] uppercase tracking-wide text-comic-yellow">{copy.detail}</span>
    </>
  )

  return (
    <article
      className={cn(
        "relative flex flex-col items-center gap-1.5 border-[3px] border-comic-cream px-2.5 pb-3 pt-3 text-center text-white",
        TONE_CLASSES[tone],
      )}
    >
      <p className="w-full whitespace-nowrap text-left text-[9px] font-black uppercase tracking-wide text-comic-navy">
        {LEAGUE_LABELS[league]} loser
      </p>
      <HomeFace person={snapshot.loser} className="mt-1 text-comic-navy" />
      <h2 className="comic-name-shadow text-2xl font-black leading-tight">
        {snapshot.loser?.name ?? "TBC"}!
      </h2>
      <p className="text-[11px] font-black uppercase tabular-nums">
        {fmtPts(snapshot.loser?.points)} pts
      </p>
      {copy.href ? (
        <Link href={copy.href} className={CAPTION_CLASSES}>
          {caption}
        </Link>
      ) : (
        <div className={CAPTION_CLASSES}>{caption}</div>
      )}
      <span
        aria-hidden
        className="absolute -right-1 bottom-1 -rotate-12 text-xl font-black text-comic-yellow"
      >
        {burst}
      </span>
    </article>
  )
}
