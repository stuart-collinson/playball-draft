import { LeagueStack } from "@pbd/components/LeagueStack/LeagueStack"
import { TableSkeleton } from "@pbd/components/LeagueTable/TableSkeleton"
import { ChartSkeleton } from "@pbd/components/Stats/ChartSkeleton"
import { STAT_TABLE_ROW_LIMIT, STAT_VIEWS } from "@pbd/lib/constants/Stats"
import type { StatSlug, StatViewSpec } from "@pbd/lib/constants/Stats"
import { countParticipants } from "@pbd/lib/constants/participants"
import type { JSX } from "react"

type StatViewSkeletonProps = {
  stat: StatSlug
  leagueIds: number[]
}

const rowCount = (spec: StatViewSpec, leagueIds: number[]): number => {
  if (spec.kind === "counts") return countParticipants(leagueIds)
  if (spec.kind === "waivers") return spec.limit ?? STAT_TABLE_ROW_LIMIT

  return STAT_TABLE_ROW_LIMIT
}

export const StatViewSkeleton = ({ stat, leagueIds }: StatViewSkeletonProps): JSX.Element => {
  const spec = STAT_VIEWS[stat]

  if (spec.kind !== "positionHistory") return <TableSkeleton rowCount={rowCount(spec, leagueIds)} />

  return (
    <LeagueStack leagueIds={leagueIds} gap="loose">
      {() => <ChartSkeleton />}
    </LeagueStack>
  )
}
