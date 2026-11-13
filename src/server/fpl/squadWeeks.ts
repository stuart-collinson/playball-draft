import "server-only"

import { FPL_ENDPOINTS } from "@pbd/lib/constants/Fpl"
import {
  NO_GAMEWEEK_RETURNS,
  buildGameweekReturnsLookups,
  tallyGameweekReturns,
} from "@pbd/lib/fpl/gameweek/gameweekReturns"
import type { GameweekReturnsLookups } from "@pbd/lib/fpl/gameweek/gameweekReturns"
import { isBenchPosition, summariseSquadWeek } from "@pbd/lib/fpl/stats/squadWeek"
import type { SquadWeekStats } from "@pbd/lib/fpl/stats/squadWeek"
import { fetchBootstrapStatic } from "@pbd/server/fpl/bootstrap"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import type {
  EntryEventPick,
  EntryEventPicksResponse,
  EventLiveResponse,
  GameweekReturns,
} from "@pbd/types/fpl.types"

type FetchedSquadWeek = SquadWeekStats & { hasPicks: boolean; returns: GameweekReturns }

const finalXiReturns = (
  picks: EntryEventPick[],
  lookups: GameweekReturnsLookups | undefined,
): GameweekReturns => {
  if (!lookups) return NO_GAMEWEEK_RETURNS

  return tallyGameweekReturns(
    picks.filter((pick) => !isBenchPosition(pick.position)).map((pick) => pick.element),
    lookups,
  )
}

export const fetchSquadWeekStats = async (
  entries: { entryApiId: number; entryId: number }[],
  finishedEvents: number[],
): Promise<Map<number, FetchedSquadWeek[]>> => {
  const [liveResults, bootstrap] = await Promise.all([
    Promise.all(
      finishedEvents.map((event) =>
        fetchFpl<EventLiveResponse>(FPL_ENDPOINTS.eventLive(event), SERVER_TTL.EVENT_LIVE_FINISHED),
      ),
    ),
    fetchBootstrapStatic(),
  ])
  const liveByEvent = new Map(finishedEvents.map((event, index) => [event, liveResults[index]]))
  const lookupsByEvent = new Map(
    finishedEvents.map((event) => [
      event,
      buildGameweekReturnsLookups(bootstrap.elements, liveByEvent.get(event) ?? null),
    ]),
  )

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
    const picks = result.picks?.picks ?? []
    const week = summariseSquadWeek(
      result.event,
      picks,
      (elementId) => live?.elements[String(elementId)],
    )
    statsByEntry.get(result.entryApiId)?.push({
      ...week,
      hasPicks: result.picks !== null,
      returns: finalXiReturns(picks, lookupsByEvent.get(result.event)),
    })
  }
  for (const weeks of statsByEntry.values()) weeks.sort((a, b) => a.event - b.event)

  return statsByEntry
}
