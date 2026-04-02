export const APP_NAME = "Playball Draft" as const

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export const TRPC_ENDPOINT = `${APP_URL}/api/trpc` as const

export const QUERY_CONFIG = {
  STALE_TIME: 30 * 1000,
  GC_TIME: 5 * 60 * 1000,
} as const
