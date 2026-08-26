import "server-only"

import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import type { EntryEventPicksResponse, EventLiveResponse } from "@pbd/types/fpl.types"

export type SquadWeekStats = {
  event: number
  benchPoints: number
  starterGoals: number
  starterAssists: number
}

const BENCH_START_POSITION = 12

export const fetchSquadWeekStats = async (
  entries: { entryApiId: number; entryId: number }[],
  finishedEvents: number[],
): Promise<Map<number, SquadWeekStats[]>> => {
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

  const statsByEntry = new Map<number, SquadWeekStats[]>(
    entries.map((entry) => [entry.entryApiId, []]),
  )

  for (const result of picksResults) {
    const live = liveByEvent.get(result.event)
    const picks = result.picks?.picks ?? []
    const week: SquadWeekStats = {
      event: result.event,
      benchPoints: 0,
      starterGoals: 0,
      starterAssists: 0,
    }
    for (const pick of picks) {
      const stats = live?.elements[String(pick.element)]?.stats
      if (!stats) continue
      if (pick.position >= BENCH_START_POSITION) {
        week.benchPoints += stats.total_points
        continue
      }
      week.starterGoals += stats.goals_scored
      week.starterAssists += stats.assists
    }
    statsByEntry.get(result.entryApiId)?.push(week)
  }
  for (const weeks of statsByEntry.values()) weeks.sort((a, b) => a.event - b.event)

  return statsByEntry
}
