import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { SERVER_TTL, fetchFplSafe } from "@pbd/server/fpl/client"
import {
  fetchLeagueDetails,
  fetchLeagueTrades,
  fetchLeagueTransactions,
} from "@pbd/server/fpl/leagueData"
import { leagueIdInput } from "@pbd/server/routers/fpl/inputs"
import { publicProcedure } from "@pbd/server/trpc"
import type {
  DraftChoicesResponse,
  LeagueDetailsResponse,
  TradesResponse,
  TransactionsResponse,
} from "@pbd/types/fpl.types"
import type { TRPCRouterRecord } from "@trpc/server"

export const leagueProcedures = {
  leagueDetails: publicProcedure
    .input(leagueIdInput)
    .query(({ input }): Promise<LeagueDetailsResponse> => fetchLeagueDetails(input.leagueId)),

  draftChoices: publicProcedure
    .input(leagueIdInput)
    .query(
      ({ input }): Promise<DraftChoicesResponse | null> =>
        fetchFplSafe(FPL_ENDPOINTS.draftChoices(input.leagueId), SERVER_TTL.DRAFT_CHOICES),
    ),

  transactions: publicProcedure
    .input(leagueIdInput)
    .query(({ input }): Promise<TransactionsResponse> => fetchLeagueTransactions(input.leagueId)),

  leagueTrades: publicProcedure
    .input(leagueIdInput)
    .query(({ input }): Promise<TradesResponse> => fetchLeagueTrades(input.leagueId)),
} satisfies TRPCRouterRecord
