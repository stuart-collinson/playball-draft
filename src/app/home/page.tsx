import { HomeScreens } from "@pbd/components/Home/HomeScreens"
import { LEAGUE_IDS } from "@pbd/lib/constants/fpl"
import { hasGateAccess, isForfeitsConfigured } from "@pbd/server/forfeits/gate"
import { HydrateClient, api, getQueryClient } from "@pbd/trpc/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import type { JSX } from "react"

export const dynamic = "force-dynamic"

export const metadata: Metadata = { title: "Home" }

const HomePage = async (): Promise<JSX.Element> => {
  const requestHeaders = await headers()
  const canViewForfeits = isForfeitsConfigured() && hasGateAccess("view", requestHeaders)

  const qc = getQueryClient()
  await qc.prefetchQuery(api.fpl.gameState.queryOptions())

  void Promise.all([
    qc.prefetchQuery(api.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP })),
    qc.prefetchQuery(api.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.CHAMPIONSHIP })),
    qc.prefetchQuery(
      api.fpl.currentGwGoalsScored.queryOptions({ leagueIds: [LEAGUE_IDS.PREMIERSHIP] }),
    ),
    qc.prefetchQuery(
      api.fpl.currentGwGoalsScored.queryOptions({ leagueIds: [LEAGUE_IDS.CHAMPIONSHIP] }),
    ),
    qc.prefetchQuery(api.fpl.currentGwPoints.queryOptions({ leagueIds: [LEAGUE_IDS.PREMIERSHIP] })),
    qc.prefetchQuery(
      api.fpl.currentGwPoints.queryOptions({ leagueIds: [LEAGUE_IDS.CHAMPIONSHIP] }),
    ),
  ])

  return (
    <HydrateClient>
      <HomeScreens canViewForfeits={canViewForfeits} />
    </HydrateClient>
  )
}

export default HomePage
