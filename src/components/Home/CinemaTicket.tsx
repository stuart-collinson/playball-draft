import { HomeFace } from "@pbd/components/Home/HomeFace"
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
  gameweek: string
}

const TASK_CLASSES = "text-[10px] font-black uppercase leading-tight text-cinema-pink"

const PENDING_HEADLINE: Record<LeagueSlug, string> = {
  premiership: "Bring the snacks",
  championship: "Reality can wait",
}

const PENDING_DETAIL = "Forfeit coming soon..."

export const CinemaTicket = ({ league, snapshot, gameweek }: Props): JSX.Element => {
  const copy =
    snapshot.forfeit.state === "complete"
      ? forfeitStatusCopy(snapshot.forfeit)
      : { headline: PENDING_HEADLINE[league], detail: PENDING_DETAIL, href: null }

  return (
    <article className="ticket-glow relative flex min-h-0 flex-col items-center gap-1 border border-dashed border-cinema-cyan bg-cinema-card px-2.5 pb-3 pt-2.5 text-center">
      <span
        aria-hidden
        className="absolute -left-1.5 top-[38%] h-3 w-3 rounded-full bg-cinema-night"
      />
      <span
        aria-hidden
        className="absolute -right-1.5 top-[38%] h-3 w-3 rounded-full bg-cinema-night"
      />
      <div className="flex w-full justify-between text-[9px] font-bold uppercase tracking-wide text-cinema-cyan">
        <span>{LEAGUE_LABELS[league]} loser</span>
        <b>{gameweek}</b>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1">
        <HomeFace person={snapshot.loser} className="mb-1 text-cinema-pink" />
        <strong className="text-lg font-black uppercase leading-tight">
          {snapshot.loser?.name ?? "TBC"}
        </strong>
        <small className="text-[11px] tabular-nums text-cinema-lilac">
          {fmtPts(snapshot.loser?.points)} points
        </small>
      </div>
      <div className="my-1.5 w-full shrink-0 border-t border-dashed border-cinema-lilac" />
      {copy.href ? (
        <Link href={copy.href} className={TASK_CLASSES}>
          {copy.headline}
        </Link>
      ) : (
        <p className={TASK_CLASSES}>{copy.headline}</p>
      )}
      <p className="text-[8px] uppercase tracking-wide text-cinema-lilac">{copy.detail}</p>
    </article>
  )
}
