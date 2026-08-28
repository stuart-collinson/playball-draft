import { ForfeitDeleteButton } from "@pbd/components/Forfeits/ForfeitDeleteButton"
import { ForfeitEditButton } from "@pbd/components/Forfeits/ForfeitEditButton"
import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import { forfeitDisplayLabel, participantLabelForSlug } from "@pbd/lib/forfeits"
import type { RouterOutput } from "@pbd/types/api.types"
import type { JSX } from "react"

type ForfeitSummary = RouterOutput["forfeits"]["list"]["items"][number]

type Props = {
  forfeit: ForfeitSummary
}

const gameweekLabel = (gameweek: string): string =>
  gameweek === "annual" ? "Annual" : `GW ${gameweek}`

export const ForfeitAdminRow = ({ forfeit }: Props): JSX.Element => (
  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
    <img
      src={forfeit.thumbUrl}
      alt={forfeit.title}
      loading="lazy"
      className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover"
    />
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <p className="truncate text-sm font-bold text-foreground">{forfeit.title}</p>
      <p className="truncate text-xs text-muted-foreground">
        {gameweekLabel(forfeit.gameweek)} · {participantLabelForSlug(forfeit.person)} ·{" "}
        {LEAGUE_LABELS[forfeit.league]}
      </p>
      <p className="truncate text-xs text-muted-foreground">
        {forfeitDisplayLabel(forfeit.type, forfeit.subType)}
      </p>
    </div>
    <div className="flex shrink-0 items-center gap-0.5">
      <ForfeitEditButton id={forfeit.id} />
      <ForfeitDeleteButton id={forfeit.id} title={forfeit.title} />
    </div>
  </div>
)
