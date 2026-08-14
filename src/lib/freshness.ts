import { hours, minutes, seconds } from "@pbd/lib/time"
import type { GamePhase } from "@pbd/types/game.types"

// Client-side cache tiers. staleTime governs mount/window-focus refetches;
// polling is layered separately via the interval maps below. gcTime must
// always be >= staleTime.
export const FRESHNESS = {
  live: { staleTime: seconds(5), gcTime: minutes(5) },
  matchDay: { staleTime: minutes(2), gcTime: minutes(15) },
  gameweek: { staleTime: minutes(30), gcTime: hours(2) },
  stable: { staleTime: hours(6), gcTime: hours(12) },
} as const

// refetchInterval for live-tier queries, keyed by game phase.
// false = no polling; staleTime + refetchOnWindowFocus keep data fresh.
export const LIVE_POLL_INTERVALS: Record<GamePhase, number | false> = {
  live: seconds(10),
  imminent: seconds(60),
  break: false,
  idle: false,
}

// The gameState heartbeat schedules itself so the app notices kickoffs
// even when no live-tier query is being polled.
export const GAME_STATE_POLL_INTERVALS: Record<GamePhase, number> = {
  live: seconds(30),
  imminent: seconds(30),
  break: minutes(5),
  idle: minutes(15),
}
