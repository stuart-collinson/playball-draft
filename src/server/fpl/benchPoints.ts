import "server-only"

import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import type { EntryEventPicksResponse, EventLiveResponse } from "@pbd/types/fpl.types"

export type BenchPointsRow = { event: number; benchPoints: number }

const BENCH_START_POSITION = 12

export const fetchBenchPoints = async (
  entries: { entryApiId: number; entryId: number }[],
  finishedEvents: number[],
): Promise<Map<number, BenchPointsRow[]>> => {
  const liveResults = await Promise.all(
    finishedEvents.map((event) =>
      fetchFpl<EventLiveResponse>(FPL_ENDPOINTS.eventLive(event), SERVER_TTL.EVENT_LIVE_FINISHED),
    ),
  )
  const liveByEvent = new Map(finishedEvents.map((event, index) => [event, liveResults[index]]))

  const picksResults = await Promise.all(
    entries.flatMap((entry) =>
      finishedEvents.map(async (event) => ({
        entryApiId: entry.entryApiId,
        event,
        picks: await fetchFplSafe<EntryEventPicksResponse>(
          FPL_ENDPOINTS.entryEventPicks(entry.entryId, event),
          SERVER_TTL.PICKS_FINAL,
        ),
      })),
    ),
  )

  const benchByEntry = new Map<number, BenchPointsRow[]>(
    entries.map((entry) => [entry.entryApiId, []]),
  )
  for (const result of picksResults) {
    const live = liveByEvent.get(result.event)
    const benchPoints = (result.picks?.picks ?? [])
      .filter((pick) => pick.position >= BENCH_START_POSITION)
      .reduce(
        (sum, pick) => sum + (live?.elements[String(pick.element)]?.stats.total_points ?? 0),
        0,
      )
    benchByEntry.get(result.entryApiId)?.push({ event: result.event, benchPoints })
  }
  for (const rows of benchByEntry.values()) rows.sort((a, b) => a.event - b.event)

  return benchByEntry
}
