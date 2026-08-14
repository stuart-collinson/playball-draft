import "server-only"

import { TRPCError } from "@trpc/server"

// FPL's WAF blocks non-browser user agents from datacenter IPs — every
// request must carry a realistic browser UA (see commit f95a348).
const FPL_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
}

// Next.js Data Cache TTLs (seconds). One constant per endpoint and lifecycle
// state: a gameweek's live/picks URLs move from the live constant to the
// *_FINAL one exactly once, when the gameweek finishes — the last live-tier
// cache entry may serve for up to its own short TTL past that flip, well
// inside the next-morning restatement window. These are the server-side
// freshness floor shared by every user; tune against measured in-season
// Fastly edge TTLs after GW1 (see the tuning runbook in the plan).
export const SERVER_TTL = {
  GAME: 10,
  EVENT_LIVE: 10,
  // Finished gameweeks' live data; can still be restated until the
  // next-morning sign-off, so 6h rather than forever.
  EVENT_LIVE_FINAL: 21600,
  LEAGUE_DETAILS: 10,
  ENTRY_HISTORY: 120,
  // Current gameweek. Picks are locked at the deadline and auto-subs only
  // resolve at the end of the gameweek, so this doesn't need to be as fast as
  // the live tier — and it's fetched once per league entry, making it the
  // single biggest source of upstream requests during a live gameweek.
  PICKS_LIVE: 300,
  // Finalised GWs; scores are restatable until 09:00 the next morning, so 6h not Infinity.
  PICKS_FINAL: 21600,
  ELEMENT_SUMMARY: 300,
  BOOTSTRAP: 300,
  TRANSACTIONS: 300,
  TRADES: 300,
  // Leagues may redraft up to 3x mid-season — never assume immutable.
  DRAFT_CHOICES: 3600,
} as const

// A Next data-cache hit is replayed from storage carrying the headers captured
// when the entry was written, so logging those would report a stale observation
// and there is nothing in the response to tell a replay from a real request.
// Only a genuine upstream round trip takes meaningful time, so duration is the
// discriminator — which also keeps the log to the handful of real fetches per
// TTL window rather than every cache read.
const CACHE_REPLAY_MAX_MS = 20

// Logs Fastly's cache headers for real upstream fetches so the in-season edge
// floor can be measured during the first live gameweek — that measurement is
// what the SERVER_TTL values above get tuned against.
//
// ON by default for the GW1 measurement window. Once tuned, turn it off by
// setting FPL_LOG_CACHE=0 in the environment (Vercel project settings).
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

// Missing-resource read: null ONLY on 404 (the resource legitimately doesn't
// exist — e.g. picks for a gameweek before an entry's league started); any
// other failure throws. Use where scoring a transient 5xx as zero would
// silently present wrong totals as truth.
export const fetchFplOrNotFound = async <T>(url: string, revalidate: number): Promise<T | null> => {
  const res = await timedFetch(url, revalidate)
  if (res.status === 404) return null
  if (!res.ok)
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: `FPL API error: ${res.status} ${res.statusText}`,
    })
  return res.json() as Promise<T>
}

// Best-effort read: callers treat null as "this piece of data is missing" and
// degrade. Catches rather than only checking res.ok, because a dropped
// connection or DNS failure rejects the fetch outright and would otherwise
// take down a caller that has no way to act on it.
export const fetchFplSafe = async <T>(url: string, revalidate: number): Promise<T | null> => {
  try {
    const res = await timedFetch(url, revalidate)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}
