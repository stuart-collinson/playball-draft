import { BackLink } from "@pbd/components/BackLink/BackLink"
import { LeagueFilter } from "@pbd/components/LeagueFilter/LeagueFilter"
import type { JSX, ReactNode } from "react"

type PageTitleProps = {
  title: string
  backHref?: string
  showLeagueFilter?: boolean
  action?: ReactNode
}

export const PageTitle = ({
  title,
  backHref,
  showLeagueFilter = true,
  action,
}: PageTitleProps): JSX.Element => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
    <div className="flex items-center gap-2">
      {backHref && <BackLink href={backHref} />}
      <h1 className="min-w-0 flex-1 text-xl font-bold text-foreground">{title}</h1>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    {showLeagueFilter && <LeagueFilter />}
  </div>
)
