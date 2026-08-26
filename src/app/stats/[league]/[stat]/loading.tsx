"use client"

import { TableSkeleton } from "@pbd/components/LeagueTable/TableSkeleton"
import { PageTitle } from "@pbd/components/PageTitle"
import { StatHelp } from "@pbd/components/Stats/StatHelp"
import { StatViewSkeleton } from "@pbd/components/Stats/StatViewSkeleton"
import { EXTRA_BACK_HREF } from "@pbd/lib/constants/Pages"
import { IS_VALID_STAT_SLUG, STAT_LABELS } from "@pbd/lib/constants/Stats"
import { getLeagueIds, parseLeagueScope } from "@pbd/lib/leagues"
import { usePathname } from "next/navigation"
import type { JSX } from "react"

const STAT_SEGMENT_INDEX = 2

const StatLoading = (): JSX.Element => {
  const pathname = usePathname()
  const stat = pathname.split("/").filter(Boolean)[STAT_SEGMENT_INDEX] ?? ""

  if (!IS_VALID_STAT_SLUG(stat)) return <TableSkeleton />

  return (
    <>
      <PageTitle title={STAT_LABELS[stat]} backHref={EXTRA_BACK_HREF} />
      <StatHelp stat={stat} />
      <StatViewSkeleton stat={stat} leagueIds={getLeagueIds(parseLeagueScope(pathname))} />
    </>
  )
}

export default StatLoading
