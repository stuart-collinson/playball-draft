"use client"

import { TableSkeleton } from "@pbd/components/LeagueTable/TableSkeleton"
import { PageTitle } from "@pbd/components/PageTitle"
import { useLeagueScope } from "@pbd/hooks/useLeagueScope"
import { PAGE_TITLES } from "@pbd/lib/constants/Pages"
import { countParticipants } from "@pbd/lib/constants/participants"
import { getLeagueIds } from "@pbd/lib/leagues"
import type { JSX } from "react"

const LeaguesLoading = (): JSX.Element => {
  const scope = useLeagueScope()

  return (
    <>
      <PageTitle title={PAGE_TITLES.leagues} />
      <TableSkeleton rowCount={countParticipants(getLeagueIds(scope))} />
    </>
  )
}

export default LeaguesLoading
