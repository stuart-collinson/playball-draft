import { LeagueFilter } from "@pbd/components/LeagueFilter/LeagueFilter"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
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
      {backHref && (
        <Link
          href={backHref}
          aria-label="Back"
          className="-ml-1 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </Link>
      )}
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
    </div>
    {showLeagueFilter && <LeagueFilter />}
  </div>
)
