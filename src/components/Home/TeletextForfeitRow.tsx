import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import { forfeitStatusCopy } from "@pbd/lib/homeScreen"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { HomeLeagueSnapshot } from "@pbd/types/home.types"
import Link from "next/link"
import type { JSX } from "react"

type Props = {
  league: LeagueSlug
  snapshot: HomeLeagueSnapshot
}

export const TeletextForfeitRow = ({ league, snapshot }: Props): JSX.Element => {
  const copy = forfeitStatusCopy(snapshot.forfeit)
  const headline = `> ${copy.headline}`

  return (
    <div className="border-b border-dotted border-teletext-olive px-2 pb-2.5 pt-2.5 uppercase">
      <div className="flex items-center justify-between gap-3">
        <span className="w-24 shrink-0 text-[10px] text-teletext-lime/70">
          {LEAGUE_LABELS[league]}
        </span>
        <span className="flex-1 text-base font-bold text-white">
          {snapshot.loser?.name ?? "TBC"}
        </span>
        <strong className="text-base tabular-nums text-teletext-yellow">
          {fmtPts(snapshot.loser?.points)} PTS
        </strong>
      </div>
      <div className="mt-1 flex justify-between gap-3 pl-[6.75rem] text-[11px] text-teletext-lime">
        {copy.href ? (
          <Link href={copy.href} className="underline-offset-2 hover:underline">
            {headline}
          </Link>
        ) : (
          <span>{headline}</span>
        )}
        <span className="text-white/60">
          {snapshot.forfeit.state === "complete" ? "FT" : "TBD"}
        </span>
      </div>
    </div>
  )
}
