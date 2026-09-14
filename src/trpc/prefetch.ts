import "server-only"

import { LEAGUE_SLUGS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/Fpl"
import { api, getQueryClient } from "@pbd/trpc/server"

export const prefetchLeagueTableQueries = (leagueIds: number[]): Promise<unknown> => {
  const queryClient = getQueryClient()

  return Promise.all([
    ...LEAGUE_SLUGS.map((slug) =>
      queryClient.prefetchQuery(
        api.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_SLUG_TO_ID[slug] }),
      ),
    ),
    queryClient.prefetchQuery(api.fpl.bootstrapStatic.queryOptions()),
    ...leagueIds.flatMap((leagueId) => [
      queryClient.prefetchQuery(api.fpl.currentGwToPlay.queryOptions({ leagueIds: [leagueId] })),
      queryClient.prefetchQuery(
        api.fpl.currentGwGoalsAndAssists.queryOptions({ leagueIds: [leagueId] }),
      ),
      queryClient.prefetchQuery(api.fpl.currentGwPoints.queryOptions({ leagueIds: [leagueId] })),
    ]),
  ])
}
