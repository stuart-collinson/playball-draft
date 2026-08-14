import "server-only"

import { TRPCError } from "@trpc/server"

// FPL's WAF blocks non-browser user agents from datacenter IPs — every
// request must carry a realistic browser UA (see commit f95a348).
const FPL_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
}

// Next.js Data Cache TTLs (seconds). One constant per endpoint so the same
// URL is never fetched with two different revalidate values. These are the
// server-side freshness floor shared by every user; tune against measured
// in-season Fastly edge TTLs after GW1 (see the tuning runbook in the plan).
export const SERVER_TTL = {
  GAME: 10,
  EVENT_LIVE: 10,
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

// Logs Fastly's cache headers per fetch so the in-season edge-cache floor can
// be measured during the first live gameweek — that measurement is what the
// SERVER_TTL values above get tuned against.
//
// ON by default for the GW1 measurement window. Once tuned, turn it off by
// setting FPL_LOG_CACHE=0 in the environment (Vercel project settings).
const logEdgeHeaders = (url: string, res: Response): void => {
  if (process.env.FPL_LOG_CACHE === "0") return
  console.log(
    `[fpl] ${url} x-cache=${res.headers.get("x-cache")} age=${res.headers.get("age")} edge-control=${res.headers.get("edge-control")}`,
  )
}

export const fetchFpl = async <T>(url: string, revalidate: number): Promise<T> => {
  const res = await fetch(url, { headers: FPL_HEADERS, next: { revalidate } })
  logEdgeHeaders(url, res)
  if (!res.ok)
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: `FPL API error: ${res.status} ${res.statusText}`,
    })
  return res.json() as Promise<T>
}

export const fetchFplSafe = async <T>(url: string, revalidate: number): Promise<T | null> => {
  const res = await fetch(url, { headers: FPL_HEADERS, next: { revalidate } })
  logEdgeHeaders(url, res)
  if (!res.ok) return null
  return res.json() as Promise<T>
}
