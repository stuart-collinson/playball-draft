"use client"

import { LeagueStack } from "@pbd/components/LeagueStack/LeagueStack"
import { FreeAgentXiView } from "@pbd/components/Stats/FreeAgentXiView"
import { MarketReportView } from "@pbd/components/Stats/MarketReportView"
import { PointsRaceChart } from "@pbd/components/Stats/PointsRaceChart"
import { PositionHistoryChart } from "@pbd/components/Stats/PositionHistoryChart"
import { RecordsBoard } from "@pbd/components/Stats/RecordsBoard"
import { RivalryGrid } from "@pbd/components/Stats/RivalryGrid"
import { AllPlayTable } from "@pbd/components/Tables/AllPlayTable"
import { BenchTable } from "@pbd/components/Tables/BenchTable"
import { BestTradesTable } from "@pbd/components/Tables/BestTradesTable"
import { BestWaiversTable } from "@pbd/components/Tables/BestWaiversTable"
import { DraftBoardView } from "@pbd/components/Tables/DraftBoardView"
import { FormTable } from "@pbd/components/Tables/FormTable"
import { GotAwayTable } from "@pbd/components/Tables/GotAwayTable"
import { GwCountsTable } from "@pbd/components/Tables/GwCountsTable"
import { GwLeaderboardTable } from "@pbd/components/Tables/GwLeaderboardTable"
import { PaceTable } from "@pbd/components/Tables/PaceTable"
import { ScoreDistributionTable } from "@pbd/components/Tables/ScoreDistributionTable"
import { StreaksTable } from "@pbd/components/Tables/StreaksTable"
import { TinkerTable } from "@pbd/components/Tables/TinkerTable"
import { TreatmentTable } from "@pbd/components/Tables/TreatmentTable"
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
          direction={spec.direction}
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
    case "pointsRace":
      return (
        <LeagueStack leagueIds={leagueIds} gap="loose">
          {(leagueId) => <PointsRaceChart leagueId={leagueId} />}
        </LeagueStack>
      )
    case "allPlay":
      return <AllPlayTable leagueIds={leagueIds} variant={spec.variant} />
    case "distribution":
      return <ScoreDistributionTable leagueIds={leagueIds} variant={spec.variant} />
    case "bench":
      return <BenchTable leagueIds={leagueIds} />
    case "form":
      return <FormTable leagueIds={leagueIds} />
    case "streaks":
      return <StreaksTable leagueIds={leagueIds} />
    case "tinker":
      return <TinkerTable leagueIds={leagueIds} />
    case "pace":
      return <PaceTable leagueIds={leagueIds} />
    case "records":
      return <RecordsBoard leagueIds={leagueIds} />
    case "rivalry":
      return <RivalryGrid leagueIds={leagueIds} />
    case "draft":
      return <DraftBoardView leagueIds={leagueIds} variant={spec.variant} />
    case "gotAway":
      return <GotAwayTable leagueIds={leagueIds} />
    case "marketReport":
      return <MarketReportView leagueIds={leagueIds} />
    case "freeAgentXi":
      return <FreeAgentXiView leagueIds={leagueIds} />
    case "treatment":
      return <TreatmentTable leagueIds={leagueIds} />
  }
}
