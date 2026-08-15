import "server-only"

import { TRPCError } from "@trpc/server"

const FPL_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Encoding": "gzip, deflate, br",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-GB,en;q=0.9",
}

export const SERVER_TTL = {
  GAME: 10,
  EVENT_LIVE: 10,
  LEAGUE_DETAILS: 10,
  ENTRY_HISTORY: 120,
  PICKS_LIVE: 300,
  PICKS_FINAL: 21600,
  ELEMENT_SUMMARY: 300,
  BOOTSTRAP: 300,
  TRANSACTIONS: 300,
  TRADES: 300,
  DRAFT_CHOICES: 3600,
} as const

const CACHE_REPLAY_MAX_MS = 20

const logEdgeHeaders = (url: string, res: Response, durationMs: number): void => {
  if (process.env.FPL_LOG_CACHE === "0") return
  if (durationMs < CACHE_REPLAY_MAX_MS) return
  console.log(
    `[fpl] ${durationMs}ms ${url} x-cache=${res.headers.get("x-cache")} age=${res.headers.get("age")} edge-control=${res.headers.get("edge-control")}`,
  )
}

const timedFetch = async (url: string, revalidate: number): Promise<Response> => {
  const startedAt = Date.now()
  const res = await fetch(url, { headers: FPL_HEADERS, next: { revalidate } })
  logEdgeHeaders(url, res, Date.now() - startedAt)
  return res
}

export const fetchFpl = async <T>(url: string, revalidate: number): Promise<T> => {
  const res = await timedFetch(url, revalidate)
  if (!res.ok)
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: `FPL API error: ${res.status} ${res.statusText}`,
    })
  return res.json() as Promise<T>
}

export const fetchFplSafe = async <T>(url: string, revalidate: number): Promise<T | null> => {
  try {
    const res = await timedFetch(url, revalidate)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}
