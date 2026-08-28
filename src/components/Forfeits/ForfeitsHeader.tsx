import { BackLink } from "@pbd/components/BackLink/BackLink"
import { ForfeitCadenceFilter } from "@pbd/components/Forfeits/ForfeitCadenceFilter"
import { ForfeitLeagueFilter } from "@pbd/components/Forfeits/ForfeitLeagueFilter"
import type { LeagueScope } from "@pbd/lib/leagues"
import type { JSX } from "react"

type Props = {
  scope: LeagueScope
  backHref: string
}

export const ForfeitsHeader = ({ scope, backHref }: Props): JSX.Element => (
  <div className="mb-6 flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <BackLink href={backHref} />
      <h1 className="text-xl font-bold text-foreground">Forfeits</h1>
    </div>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <ForfeitCadenceFilter />
      <ForfeitLeagueFilter scope={scope} />
    </div>
  </div>
)
