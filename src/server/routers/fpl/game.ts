import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { deriveGamePhase, findNextDeadline } from "@pbd/lib/fpl/gamePhase"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import { publicProcedure } from "@pbd/server/trpc"
import type { BootstrapStaticResponse, EventLiveResponse, FplGame } from "@pbd/types/fpl.types"
import type { GameState } from "@pbd/types/game.types"
import type { TRPCRouterRecord } from "@trpc/server"

export const gameProcedures = {
  gameState: publicProcedure.query(async (): Promise<GameState> => {
    const game = await fetchFpl<FplGame>(FPL_ENDPOINTS.game(), SERVER_TTL.GAME)
    const seasonOver = game.current_event_finished && game.next_event === null
    const currentEvent = game.current_event

    if (!currentEvent) {
      const bootstrap = await fetchFplSafe<BootstrapStaticResponse>(
        FPL_ENDPOINTS.bootstrapStatic(),
        SERVER_TTL.BOOTSTRAP,
      )

      return {
        currentEvent: null,
        phase: "idle",
        seasonOver,
        nextDeadline: findNextDeadline(bootstrap?.events?.data ?? [], new Date()),
      }
    }

    const live = await fetchFpl<EventLiveResponse>(
      FPL_ENDPOINTS.eventLive(currentEvent),
      SERVER_TTL.EVENT_LIVE,
    )

    return {
      currentEvent,
      phase: deriveGamePhase(live.fixtures ?? [], new Date()),
      seasonOver,
      nextDeadline: null,
    }
  }),
} satisfies TRPCRouterRecord
