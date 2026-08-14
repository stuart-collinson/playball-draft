import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { deriveGamePhase, findNextKickoff } from "@pbd/lib/fpl/gamePhase"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import { publicProcedure } from "@pbd/server/trpc"
import type { EventLiveResponse, FplGame } from "@pbd/types/fpl.types"
import type { GameState } from "@pbd/types/game.types"
import type { TRPCRouterRecord } from "@trpc/server"

export const gameProcedures = {
  // The app's freshness heartbeat. /api/game is a ~150-byte payload carrying
  // the current event, so nothing else has to fetch the ~700-element
  // bootstrap just to answer "which gameweek is it?".
  gameState: publicProcedure.query(async (): Promise<GameState> => {
    const game = await fetchFpl<FplGame>(FPL_ENDPOINTS.game(), SERVER_TTL.GAME)
    const seasonOver = game.current_event_finished && game.next_event === null
    const currentEvent = game.current_event

    if (!currentEvent) return { currentEvent: null, phase: "idle", nextKickoff: null, seasonOver }

    const live = await fetchFplSafe<EventLiveResponse>(
      FPL_ENDPOINTS.eventLive(currentEvent),
      SERVER_TTL.EVENT_LIVE,
    )
    const fixtures = live?.fixtures ?? []
    const now = new Date()

    return {
      currentEvent,
      phase: deriveGamePhase(fixtures, now),
      nextKickoff: findNextKickoff(fixtures, now),
      seasonOver,
    }
  }),
} satisfies TRPCRouterRecord
