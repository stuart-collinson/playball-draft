import "server-only"

import { FPL_ENDPOINTS } from "@pbd/lib/constants/Fpl"
import {
  NO_GAMEWEEK_RETURNS,
  buildGameweekReturnsLookups,
  officialXiReturns,
} from "@pbd/lib/fpl/gameweek/gameweekReturns"
import { summariseSquadWeek } from "@pbd/lib/fpl/stats/squadWeek"
import type { SquadWeekStats } from "@pbd/lib/fpl/stats/squadWeek"
import { fetchBootstrapStatic } from "@pbd/server/fpl/bootstrap"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import type {
  EntryEventPick,
  EntryEventPicksResponse,
  EventLiveResponse,
  GameweekReturns,
  GameweekReturnsLookups,
} from "@pbd/types/fpl.types"

type FetchedSquadWeek = SquadWeekStats & { hasPicks: boolean; returns: GameweekReturns }

type SquadEntry = {
  entryApiId: number
  entryId: number
}

type SquadWeekRequest = SquadEntry & { event: number }

const finalXiReturns = (
  picks: EntryEventPick[],
  lookups: GameweekReturnsLookups | undefined,
): GameweekReturns => (lookups ? officialXiReturns(picks, lookups) : NO_GAMEWEEK_RETURNS)

export const fetchSquadWeeks = async (
  requests: SquadWeekRequest[],
): Promise<Map<number, FetchedSquadWeek[]>> => {
  const events = [...new Set(requests.map((request) => request.event))]
  const [liveResults, bootstrap] = await Promise.all([
    Promise.all(
      events.map((event) =>
        fetchFpl<EventLiveResponse>(FPL_ENDPOINTS.eventLive(event), SERVER_TTL.EVENT_LIVE_FINISHED),
      ),
    ),
    fetchBootstrapStatic(),
  ])
  const liveByEvent = new Map(events.map((event, index) => [event, liveResults[index]]))
  const lookupsByEvent = new Map(
    events.map((event) => [
      event,
      buildGameweekReturnsLookups(bootstrap.elements, liveByEvent.get(event) ?? null),
    ]),
  )

  const picksResults = await Promise.all(
    requests.map(async (request) => ({
      entryApiId: request.entryApiId,
      event: request.event,
      picks: await fetchFplSafe<EntryEventPicksResponse>(
        FPL_ENDPOINTS.entryEventPicks(request.entryId, request.event),
        SERVER_TTL.PICKS_FINAL,
      ),
    })),
  )

  const statsByEntry = new Map<number, FetchedSquadWeek[]>(
    requests.map((request) => [request.entryApiId, []]),
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
  for (const weeks of statsByEntry.values())
    weeks.sort((first, second) => first.event - second.event)

  return statsByEntry
}

export const fetchSquadWeekStats = async (
  entries: SquadEntry[],
  finishedEvents: number[],
): Promise<Map<number, FetchedSquadWeek[]>> => {
  const weeksByEntry = await fetchSquadWeeks(
    entries.flatMap((entry) => finishedEvents.map((event) => ({ ...entry, event }))),
  )

  return new Map(
    entries.map((entry) => [entry.entryApiId, weeksByEntry.get(entry.entryApiId) ?? []]),
  )
}
