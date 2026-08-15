"use client"

import { LeagueStack } from "@pbd/components/LeagueStack/LeagueStack"
import { PositionHistoryChart } from "@pbd/components/Stats/PositionHistoryChart"
import { BestTradesTable } from "@pbd/components/Tables/BestTradesTable"
import { BestWaiversTable } from "@pbd/components/Tables/BestWaiversTable"
import { GwCountsTable } from "@pbd/components/Tables/GwCountsTable"
import { GwLeaderboardTable } from "@pbd/components/Tables/GwLeaderboardTable"
import { STAT_VIEWS } from "@pbd/lib/constants/Stats"
import type { StatSlug } from "@pbd/lib/constants/Stats"
import type { JSX } from "react"

type Props = {
  stat: StatSlug
  leagueIds: number[]
}

export const StatView = ({ stat, leagueIds }: Props): JSX.Element => {
  const spec = STAT_VIEWS[stat]

  switch (spec.kind) {
    case "leaderboard":
      return <GwLeaderboardTable leagueIds={leagueIds} type={spec.type} />
    case "counts":
      return <GwCountsTable leagueIds={leagueIds} type={spec.type} />
    case "waivers":
      return (
        <BestWaiversTable
          leagueIds={leagueIds}
          sortBy={spec.sortBy}
          minGws={spec.minGws}
          maxGws={spec.maxGws}
          limit={spec.limit}
        />
      )
    case "trades":
      return <BestTradesTable leagueIds={leagueIds} sortBy={spec.sortBy} minGws={spec.minGws} />
    case "positionHistory":
      return (
        <LeagueStack leagueIds={leagueIds} gap="loose">
          {(leagueId) => <PositionHistoryChart leagueId={leagueId} />}
        </LeagueStack>
      )
  }
}
