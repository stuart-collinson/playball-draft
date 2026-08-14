import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { SERVER_TTL, fetchFpl } from "@pbd/server/fpl/client"
import { publicProcedure } from "@pbd/server/trpc"
import type { EntryEventPicksResponse, EntryHistoryResponse, FplGame } from "@pbd/types/fpl.types"
import type { TRPCRouterRecord } from "@trpc/server"
import { z } from "zod"

export const entryProcedures = {
  entryHistory: publicProcedure
    .input(z.object({ entryId: z.number().int().positive() }))
    .query(
      ({ input }): Promise<EntryHistoryResponse> =>
        fetchFpl(FPL_ENDPOINTS.entryHistory(input.entryId), SERVER_TTL.ENTRY_HISTORY),
    ),

  entryEventPicks: publicProcedure
    .input(
      z.object({
        entryId: z.number().int().positive(),
        eventId: z.number().int().positive(),
      }),
    )
    .query(async ({ input }): Promise<EntryEventPicksResponse> => {
      const game = await fetchFpl<FplGame>(FPL_ENDPOINTS.game(), SERVER_TTL.GAME)
      // A gameweek is safely cacheable long once the game has moved past it.
      // The current one stays on the short TTL because auto-subs and live
      // context still change. A GW crosses this line exactly once, so the
      // same URL only ever moves from a short to a long revalidate.
      const isFinal = game.current_event !== null && input.eventId < game.current_event

      return fetchFpl(
        FPL_ENDPOINTS.entryEventPicks(input.entryId, input.eventId),
        isFinal ? SERVER_TTL.PICKS_FINAL : SERVER_TTL.PICKS_LIVE,
      )
    }),
} satisfies TRPCRouterRecord
