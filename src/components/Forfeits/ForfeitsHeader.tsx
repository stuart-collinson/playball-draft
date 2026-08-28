import { BackLink } from "@pbd/components/BackLink/BackLink"
import { ForfeitCadenceFilter } from "@pbd/components/Forfeits/ForfeitCadenceFilter"
import { LeagueFilter } from "@pbd/components/LeagueFilter/LeagueFilter"
import type { JSX } from "react"

type Props = {
  backHref: string
}

export const ForfeitsHeader = ({ backHref }: Props): JSX.Element => (
  <div className="mb-6 flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <BackLink href={backHref} />
      <h1 className="text-xl font-bold text-foreground">Forfeits</h1>
    </div>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <ForfeitCadenceFilter />
      <LeagueFilter />
    </div>
  </div>
)
