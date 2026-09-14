import { BackLink } from "@pbd/components/BackLink/BackLink"
import { LeagueFilter } from "@pbd/components/LeagueFilter/LeagueFilter"
import type { JSX } from "react"

type PageTitleProps = {
  title: string
  backHref?: string
  showLeagueFilter?: boolean
}

export const PageTitle = ({
  title,
  backHref,
  showLeagueFilter = true,
}: PageTitleProps): JSX.Element => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
    <div className="flex items-center gap-2">
      {backHref && <BackLink href={backHref} />}
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
    </div>
    {showLeagueFilter && <LeagueFilter />}
  </div>
)
