import { participantLabelForSlug } from "@pbd/lib/forfeits"
import type { LeagueScope } from "@pbd/lib/leagues"
import type { RouterOutput } from "@pbd/types/api.types"
import Link from "next/link"
import type { JSX } from "react"

type ForfeitSummary = RouterOutput["forfeits"]["list"]["items"][number]

type Props = {
  scope: LeagueScope
  forfeit: ForfeitSummary
}

const gameweekLabel = (gameweek: string): string =>
  gameweek === "annual" ? "Annual" : `GW ${gameweek}`

export const ForfeitCard = ({ scope, forfeit }: Props): JSX.Element => (
  <Link href={`/forfeits/${scope}/${forfeit.id}`} className="group flex flex-col gap-1">
    <p className="truncate text-sm font-bold text-foreground">{forfeit.title}</p>
    <p className="truncate text-xs text-muted-foreground">
      {gameweekLabel(forfeit.gameweek)} · {participantLabelForSlug(forfeit.person)}
    </p>
    <div className="mt-1 aspect-square overflow-hidden rounded-2xl border border-border bg-card">
      <img
        src={forfeit.thumbUrl}
        alt={forfeit.title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  </Link>
)
