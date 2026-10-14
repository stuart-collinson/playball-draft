import { HomeForfeitStatus } from "@pbd/components/Home/HomeForfeitStatus"
import { cn } from "@pbd/lib/className"
import { LEAGUE_LABELS } from "@pbd/lib/constants/Fpl"
import type { LeagueSlug } from "@pbd/lib/constants/Fpl"
import { HOME_NAME_PLACEHOLDER } from "@pbd/lib/constants/Home"
import { cupFinalBodyFont } from "@pbd/lib/fonts"
import { fmtPts } from "@pbd/lib/format"
import type { HomeLeagueSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  league: LeagueSlug
  snapshot: HomeLeagueSnapshot
}

export const CupFinalLeagueCard = ({ league, snapshot }: Props): JSX.Element => {
  const rows = [
    { label: "Top", entry: snapshot.winner, tone: "text-cupfinal-electric" },
    { label: "Bottom", entry: snapshot.loser, tone: "text-cupfinal-live" },
  ]

  return (
    <article className="flex min-w-0 flex-col gap-1 rounded-xl bg-cupfinal-navy/75 px-3 py-2 ring-1 ring-cupfinal-silver/15">
      <header className="flex items-baseline justify-between gap-2 border-b border-cupfinal-silver/10 pb-1">
        <span className="truncate text-[9px] font-black uppercase tracking-[0.2em] text-cupfinal-electric">
          {LEAGUE_LABELS[league]}
        </span>
        <strong
          className={cn(
            cupFinalBodyFont.className,
            "text-lg font-extrabold leading-none tabular-nums text-cupfinal-shine",
          )}
        >
          {fmtPts(snapshot.total)}
        </strong>
      </header>
      {rows.map(({ label, entry, tone }) => (
        <p
          key={label}
          className={cn(cupFinalBodyFont.className, "flex min-w-0 items-baseline gap-2")}
        >
          <span
            className={cn("w-10 shrink-0 text-[9px] font-bold uppercase tracking-[0.2em]", tone)}
          >
            {label}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-cupfinal-silver">
            {entry?.name ?? HOME_NAME_PLACEHOLDER}
          </span>
          <span className="shrink-0 text-sm font-extrabold tabular-nums text-cupfinal-shine">
            {fmtPts(entry?.points)}
          </span>
        </p>
      ))}
      <HomeForfeitStatus
        status={snapshot.forfeit}
        headlineClassName="text-cupfinal-silver"
        detailClassName="text-cupfinal-steel"
      />
    </article>
  )
}
