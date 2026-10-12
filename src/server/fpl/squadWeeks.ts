import "server-only"

import { FPL_ENDPOINTS } from "@pbd/lib/constants/Fpl"
import { summariseSquadWeek } from "@pbd/lib/fpl/squadWeek"
import type { SquadWeekStats } from "@pbd/lib/fpl/squadWeek"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import type { EntryEventPicksResponse, EventLiveResponse } from "@pbd/types/fpl.types"

type FetchedSquadWeek = SquadWeekStats & { hasPicks: boolean }

export const fetchSquadWeekStats = async (
  entries: { entryApiId: number; entryId: number }[],
  finishedEvents: number[],
): Promise<Map<number, FetchedSquadWeek[]>> => {
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

  const statsByEntry = new Map<number, FetchedSquadWeek[]>(
    entries.map((entry) => [entry.entryApiId, []]),
  )

  for (const result of picksResults) {
    const live = liveByEvent.get(result.event)
    const week = summariseSquadWeek(
      result.event,
      result.picks?.picks ?? [],
      (elementId) => live?.elements[String(elementId)],
    )
    statsByEntry.get(result.entryApiId)?.push({ ...week, hasPicks: result.picks !== null })
  }
  for (const weeks of statsByEntry.values()) weeks.sort((a, b) => a.event - b.event)

  return statsByEntry
}
