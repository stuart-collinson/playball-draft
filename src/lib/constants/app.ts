export const APP_NAME = "Playball Draft" as const

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export const TRPC_ENDPOINT = `${APP_URL}/api/trpc` as const

// Temporary flag — flip to true when the season ends so the "winner" and
// "loser" pills on the home page display season-long standings instead of
// current-gameweek results. Remove once we no longer need it.
export const SEASON_OVER = true as boolean;

export const QUERY_CONFIG = {
  STALE_TIME: 30 * 1000,
  GC_TIME: 5 * 60 * 1000,
} as const
