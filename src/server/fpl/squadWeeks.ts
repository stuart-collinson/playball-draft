import "server-only"

import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { SERVER_TTL, fetchFpl, fetchFplSafe } from "@pbd/server/fpl/client"
import type {
  EntryEventPicksResponse,
  EventLiveExplainEntry,
  EventLiveResponse,
} from "@pbd/types/fpl.types"

export type SquadWeekStats = {
  event: number
  benchPoints: number
  starterGoals: number
  starterAssists: number
  starterCleanSheets: number
  starterDefconPoints: number
  starterExpectedGoals: number
  starterExpectedAssists: number
}

const BENCH_START_POSITION = 12
const CLEAN_SHEET_STAT = "clean_sheets"
const DEFCON_STAT = "defensive_contribution"

type PointsAwarded = { cleanSheets: number; defconPoints: number }

const awardedFromExplain = (explain: EventLiveExplainEntry[] | undefined): PointsAwarded => {
  const awarded: PointsAwarded = { cleanSheets: 0, defconPoints: 0 }
  for (const fixture of explain ?? []) {
    for (const item of fixture[0] ?? []) {
      if (item.stat === CLEAN_SHEET_STAT) awarded.cleanSheets += item.value
      if (item.stat === DEFCON_STAT) awarded.defconPoints += item.points
    }
  }
  return awarded
}

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
      starterCleanSheets: 0,
      starterDefconPoints: 0,
      starterExpectedGoals: 0,
      starterExpectedAssists: 0,
    }
    for (const pick of picks) {
      const element = live?.elements[String(pick.element)]
      if (!element) continue
      if (pick.position >= BENCH_START_POSITION) {
        week.benchPoints += element.stats.total_points
        continue
      }
      const awarded = awardedFromExplain(element.explain)
      week.starterGoals += element.stats.goals_scored
      week.starterAssists += element.stats.assists
      week.starterCleanSheets += awarded.cleanSheets
      week.starterDefconPoints += awarded.defconPoints
      week.starterExpectedGoals += element.stats.expected_goals
      week.starterExpectedAssists += element.stats.expected_assists
    }
    statsByEntry.get(result.entryApiId)?.push(week)
  }
  for (const weeks of statsByEntry.values()) weeks.sort((a, b) => a.event - b.event)

  return statsByEntry
}
