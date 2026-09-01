import { LuckDeleteButton } from "@pbd/components/Luck/LuckDeleteButton"
import { LuckEditButton } from "@pbd/components/Luck/LuckEditButton"
import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import { gameweekLabel } from "@pbd/lib/gameweeks"
import { participantImageForSlug, participantLabelForSlug } from "@pbd/lib/people"
import type { RouterOutput } from "@pbd/types/api.types"
import type { JSX } from "react"

type LuckMomentSummary = RouterOutput["luck"]["list"][number]

type Props = {
  moment: LuckMomentSummary
}

export const LuckAdminRow = ({ moment }: Props): JSX.Element => {
  const image = participantImageForSlug(moment.person)

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
        {image && <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate font-bold text-foreground text-sm">{moment.title}</p>
        <p className="truncate text-muted-foreground text-xs">
          {gameweekLabel(moment.gameweek)} · {participantLabelForSlug(moment.person)} ·{" "}
          {LEAGUE_LABELS[moment.league]}
        </p>
        <p className="truncate text-muted-foreground text-xs">{moment.season}</p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <LuckEditButton id={moment.id} title={moment.title} description={moment.description} />
        <LuckDeleteButton id={moment.id} title={moment.title} />
      </div>
    </div>
  )
}
