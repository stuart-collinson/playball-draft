import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { SERVER_TTL, fetchFpl } from "@pbd/server/fpl/client"
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
    .query(
      ({ input }): Promise<LeagueDetailsResponse> =>
        fetchFpl(FPL_ENDPOINTS.leagueDetails(input.leagueId), SERVER_TTL.LEAGUE_DETAILS),
    ),

  draftChoices: publicProcedure
    .input(leagueIdInput)
    .query(
      ({ input }): Promise<DraftChoicesResponse> =>
        fetchFpl(FPL_ENDPOINTS.draftChoices(input.leagueId), SERVER_TTL.DRAFT_CHOICES),
    ),

  transactions: publicProcedure
    .input(leagueIdInput)
    .query(
      ({ input }): Promise<TransactionsResponse> =>
        fetchFpl(FPL_ENDPOINTS.transactions(input.leagueId), SERVER_TTL.TRANSACTIONS),
    ),

  leagueTrades: publicProcedure
    .input(leagueIdInput)
    .query(
      ({ input }): Promise<TradesResponse> =>
        fetchFpl(FPL_ENDPOINTS.trades(input.leagueId), SERVER_TTL.TRADES),
    ),
} satisfies TRPCRouterRecord
