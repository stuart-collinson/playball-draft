import { CupFinalLeagueCard } from "@pbd/components/Home/CupFinal/CupFinalLeagueCard"
import { cn } from "@pbd/lib/className"
import { LEAGUE_SLUGS } from "@pbd/lib/constants/Fpl"
import { cupFinalBodyFont } from "@pbd/lib/fonts"
import { padGameweek } from "@pbd/lib/home/homeScreen"
import type { HomeSnapshot } from "@pbd/types/home.types"
import type { JSX } from "react"

type Props = {
  snapshot: HomeSnapshot
}

export const CupFinalRoundup = ({ snapshot }: Props): JSX.Element => (
  <div className="flex shrink-0 flex-col gap-1.5">
    <h2
      className={cn(
        cupFinalBodyFont.className,
        "flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-cupfinal-steel",
      )}
    >
      <span
        aria-hidden
        className="h-px flex-1 bg-gradient-to-r from-transparent to-cupfinal-steel/50"
      />
      Around the leagues &middot; GW{padGameweek(snapshot.gameweek)}
      <span
        aria-hidden
        className="h-px flex-1 bg-gradient-to-l from-transparent to-cupfinal-steel/50"
      />
    </h2>
    <div className="grid grid-cols-2 gap-2">
      {LEAGUE_SLUGS.map((slug) => (
        <CupFinalLeagueCard key={slug} league={slug} snapshot={snapshot[slug]} />
      ))}
    </div>
  </div>
)
