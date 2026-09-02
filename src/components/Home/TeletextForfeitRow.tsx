import { forfeitStatusCopy } from "@pbd/lib/homeScreen"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { HomeLeagueSnapshot } from "@pbd/types/home.types"
import Link from "next/link"
import type { JSX } from "react"

type Props = {
  index: string
  snapshot: HomeLeagueSnapshot
}

export const TeletextForfeitRow = ({ index, snapshot }: Props): JSX.Element => {
  const copy = forfeitStatusCopy(snapshot.forfeit)
  const headline = `> ${copy.headline}`

  return (
    <div className="border-b border-dotted border-teletext-olive px-2 pb-2.5 pt-3 uppercase">
      <div className="flex justify-between text-sm font-bold text-white">
        <span>
          {index}&nbsp;&nbsp;{snapshot.loser?.name ?? "TBC"}
        </span>
        <strong className="tabular-nums text-teletext-yellow">
          {fmtPts(snapshot.loser?.points)} PTS
        </strong>
      </div>
      <div className="mt-1.5 flex justify-between gap-3 text-[11px]">
        {copy.href ? (
          <Link href={copy.href} className="underline-offset-2 hover:underline">
            {headline}
          </Link>
        ) : (
          <span>{headline}</span>
        )}
        <span className="text-white">{snapshot.forfeit.state === "complete" ? "FT" : "TBD"}</span>
      </div>
    </div>
  )
}
