import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { deriveGamePhase, findNextDeadline } from "@pbd/lib/fpl/gamePhase"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import { publicProcedure } from "@pbd/server/trpc"
import type { BootstrapStaticResponse, EventLiveResponse, FplGame } from "@pbd/types/fpl.types"
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

    if (!currentEvent) {
      // No gameweek to report on, so pay for the bootstrap once to find out
      // when the first one locks — the pre-season screen counts down to it.
      // Only reached outside a season, so the live path stays lean.
      const bootstrap = await fetchFplSafe<BootstrapStaticResponse>(
        FPL_ENDPOINTS.bootstrapStatic(),
        SERVER_TTL.BOOTSTRAP,
      )

      return {
        currentEvent: null,
        phase: "idle",
        seasonOver,
        nextDeadline: findNextDeadline(bootstrap?.events.data ?? [], new Date()),
      }
    }

    // Deliberately throwing, not fetchFplSafe: an empty fixture list is how
    // "the gameweek is over" is expressed, so swallowing a failed fetch here
    // would read as idle and silently stop all polling. Failing loudly lets
    // the client keep the last known phase and retry.
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
