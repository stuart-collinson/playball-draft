import { TELETEXT_LEAGUE_LABELS } from "@pbd/lib/constants/Home"
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
  const headline = `> ${copy.headline.toUpperCase()}`

  return (
    <div className="border-b-2 border-teletext-dim px-2 py-2.5">
      <div className="flex items-center gap-2 text-[10px]">
        <span className="w-14 shrink-0 text-[8px] text-teletext-cyan">
          {TELETEXT_LEAGUE_LABELS[league]}
        </span>
        <span className="flex-1 truncate text-white">
          {(snapshot.loser?.name ?? "TBC").toUpperCase()}
        </span>
        <strong className="shrink-0 text-teletext-yellow">{fmtPts(snapshot.loser?.points)}</strong>
      </div>
      <div className="mt-2 flex items-center gap-2 pl-16 text-[8px] leading-relaxed">
        {copy.href ? (
          <Link href={copy.href} className="flex-1 truncate text-teletext-lime underline">
            {headline}
          </Link>
        ) : (
          <span className="flex-1 truncate text-teletext-lime">{headline}</span>
        )}
        <span className="shrink-0 text-white">
          {snapshot.forfeit.state === "complete" ? "FT" : "TBD"}
        </span>
      </div>
    </div>
  )
}
