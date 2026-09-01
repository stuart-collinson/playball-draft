import { LuckDeleteButton } from "@pbd/components/Luck/LuckDeleteButton"
import { LuckEditButton } from "@pbd/components/Luck/LuckEditButton"
import { LuckPersonFace } from "@pbd/components/Luck/LuckPersonFace"
import { gameweekLabel } from "@pbd/lib/gameweeks"
import { peopleLabel, peopleLeaguesLabel } from "@pbd/lib/people"
import { cn } from "@pbd/lib/utils/cn"
import type { RouterOutput } from "@pbd/types/api.types"
import type { JSX } from "react"

type LuckMomentSummary = RouterOutput["luck"]["list"][number]

type Props = {
  moment: LuckMomentSummary
}

export const LuckAdminRow = ({ moment }: Props): JSX.Element => {
  const leagues = peopleLeaguesLabel(moment.people)
  const metaParts = [gameweekLabel(moment.gameweek), peopleLabel(moment.people)]
  const detailParts = [leagues, moment.season].filter(Boolean)

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
      <span className="flex w-14 shrink-0 items-center justify-center">
        {moment.people.map((slug, index) => (
          <LuckPersonFace
            key={slug}
            slug={slug}
            className={cn("h-10 w-10", index > 0 && "-ml-4")}
          />
        ))}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate font-bold text-foreground text-sm">{moment.title}</p>
        <p className="truncate text-muted-foreground text-xs">{metaParts.join(" · ")}</p>
        <p className="truncate text-muted-foreground text-xs">{detailParts.join(" · ")}</p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <LuckEditButton id={moment.id} title={moment.title} description={moment.description} />
        <LuckDeleteButton id={moment.id} title={moment.title} />
      </div>
    </div>
  )
}
