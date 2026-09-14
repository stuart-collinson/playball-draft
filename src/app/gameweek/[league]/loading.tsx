"use client"

import { PageTitle } from "@pbd/components/PageTitle/PageTitle"
import { TableSkeleton } from "@pbd/components/TableSkeleton/TableSkeleton"
import { useLeagueScope } from "@pbd/hooks/useLeagueScope"
import { PAGE_TITLES } from "@pbd/lib/constants/Pages"
import { countParticipants } from "@pbd/lib/constants/Participants"
import { getLeagueIds } from "@pbd/lib/leagues"
import type { JSX } from "react"

const GameweekLoading = (): JSX.Element => {
  const scope = useLeagueScope()

  return (
    <>
      <PageTitle title={PAGE_TITLES.gameweek} />
      <TableSkeleton rowCount={countParticipants(getLeagueIds(scope))} />
    </>
  )
}

export default GameweekLoading
