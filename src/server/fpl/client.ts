import "server-only"

import { AsyncLocalStorage } from "node:async_hooks"
import { TRPCError } from "@trpc/server"

const FPL_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Encoding": "gzip, deflate, br",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-GB,en;q=0.9",
}

export const SERVER_TTL = {
  GAME: 5,
  EVENT_LIVE: 5,
  EVENT_LIVE_FINISHED: 21600,
  LEAGUE_DETAILS: 5,
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

type UncachedReads = Map<string, Promise<unknown>>

const uncachedReads = new AsyncLocalStorage<UncachedReads>()

const logEdgeHeaders = (url: string, res: Response, durationMs: number): void => {
  if (process.env.FPL_LOG_CACHE !== "1") return
  if (durationMs < CACHE_REPLAY_MAX_MS) return
  console.log(
    `[fpl] ${durationMs}ms ${url} x-cache=${res.headers.get("x-cache")} age=${res.headers.get("age")} edge-control=${res.headers.get("edge-control")}`,
  )
}

const describeFailure = (error: unknown): string => {
  if (!(error instanceof Error)) return String(error)
  if (error.cause instanceof Error) return `${error.message}: ${error.cause.message}`
  return error.message
}

export const withUncachedFplReads = <T>(run: () => Promise<T>): Promise<T> =>
  uncachedReads.run(new Map(), run)

const cachePolicy = (revalidate: number): RequestInit =>
  uncachedReads.getStore() ? { cache: "no-store" } : { next: { revalidate } }

const timedFetch = async (url: string, revalidate: number): Promise<Response> => {
  const startedAt = Date.now()
  const res = await fetch(url, { headers: FPL_HEADERS, ...cachePolicy(revalidate) })
  logEdgeHeaders(url, res, Date.now() - startedAt)
  return res
}

const readFpl = async (url: string, revalidate: number): Promise<unknown> => {
  const res = await timedFetch(url, revalidate)
  if (!res.ok)
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: `FPL API error: ${res.status} ${res.statusText}`,
    })
  return res.json()
}

const readFplOncePerScope = async (
  reads: UncachedReads,
  url: string,
  revalidate: number,
): Promise<unknown> => {
  const read = reads.get(url) ?? readFpl(url, revalidate)
  reads.set(url, read)
  return structuredClone(await read)
}

export const fetchFpl = async <T>(url: string, revalidate: number): Promise<T> => {
  const reads = uncachedReads.getStore()
  try {
    const body = reads
      ? await readFplOncePerScope(reads, url, revalidate)
      : await readFpl(url, revalidate)
    return body as T
  } catch (error) {
    console.error(`[fpl] ${url} failed: ${describeFailure(error)}`)
    throw error
  }
}

export const fetchFplSafe = async <T>(url: string, revalidate: number): Promise<T | null> => {
  try {
    return await fetchFpl<T>(url, revalidate)
  } catch {
    return null
  }
}
