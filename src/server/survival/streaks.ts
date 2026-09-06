import "server-only"

import { CURRENT_SEASON } from "@pbd/lib/constants/app"
import { LEAGUE_SLUGS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl"
import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"
import { personSlug } from "@pbd/lib/people"
import { foldSurvivalStreaks, resolveGameweekLoser } from "@pbd/lib/survival"
import type { GameweekVerdict, LeagueGameweekResult } from "@pbd/lib/survival"
import { fetchLeagueDetails } from "@pbd/server/fpl/leagueData"
import { fetchSeasonScores } from "@pbd/server/fpl/seasonScores"
import type { SeasonEntry } from "@pbd/server/fpl/seasonScores"
import { fetchSquadWeekStats } from "@pbd/server/fpl/squadWeeks"
import { listSurvivalBaselines, saveSurvivalBaselines } from "@pbd/server/survival/repository"
import type { SurvivalStreaks } from "@pbd/types/survival.types"

type WeekScore = {
  entry: SeasonEntry
  points: number
}

type LeagueWeek = {
  league: LeagueSlug
  event: number
  scores: WeekScore[]
}

const LEAGUE_IDS_IN_ORDER = LEAGUE_SLUGS.map((slug) => LEAGUE_SLUG_TO_ID[slug])

const UNRANKED = Number.MAX_SAFE_INTEGER

const personFor = (entry: SeasonEntry): string =>
  personSlug(PARTICIPANT_BY_API_ID[entry.entryApiId]?.name ?? entry.managerName)

const goalsKey = (entryApiId: number, event: number): string => `${entryApiId}-${event}`

const weekScores = (entries: SeasonEntry[], event: number): WeekScore[] =>
  entries.flatMap((entry) => {
    const row = entry.rows.find((candidate) => candidate.event === event)
    return row ? [{ entry, points: row.points }] : []
  })

const lowestScorers = (scores: WeekScore[]): WeekScore[] => {
  const lowest = Math.min(...scores.map((score) => score.points))
  return scores.filter((score) => score.points === lowest)
}

const goalsForTiedWeeks = async (weeks: LeagueWeek[]): Promise<Map<string, number>> => {
  const tiedWeeks = weeks.filter((week) => lowestScorers(week.scores).length > 1)
  if (tiedWeeks.length === 0) return new Map()

  const tiedEntries = new Map(
    tiedWeeks.flatMap((week) =>
      lowestScorers(week.scores).map(({ entry }) => [entry.entryApiId, entry] as const),
    ),
  )
  const tiedEvents = [...new Set(tiedWeeks.map((week) => week.event))]

  const statsByEntry = await fetchSquadWeekStats(
    [...tiedEntries.values()].map(({ entryApiId, entryId }) => ({ entryApiId, entryId })),
    tiedEvents,
  )

  return new Map(
    [...statsByEntry].flatMap(([entryApiId, squadWeeks]) =>
      squadWeeks.map((week) => [goalsKey(entryApiId, week.event), week.starterGoals] as const),
    ),
  )
}

const bakeSeasonBaseline = async (
  streaks: SurvivalStreaks,
  finalGameweek: number,
): Promise<void> => {
  if (streaks.asOfSeason !== CURRENT_SEASON) return

  try {
    await saveSurvivalBaselines(streaks.streaks, CURRENT_SEASON, finalGameweek)
  } catch (error) {
    console.error("[survival] failed to bake the season baseline", error)
  }
}

export const resolveSurvivalStreaks = async (): Promise<SurvivalStreaks> => {
  const [baselines, season, allDetails] = await Promise.all([
    listSurvivalBaselines(),
    fetchSeasonScores(LEAGUE_IDS_IN_ORDER),
    Promise.all(LEAGUE_IDS_IN_ORDER.map(fetchLeagueDetails)),
  ])

  const tableRanks = new Map(
    allDetails.flatMap((details) =>
      details.standings.map((standing) => [standing.league_entry, standing.rank] as const),
    ),
  )

  const weeks: LeagueWeek[] = LEAGUE_SLUGS.flatMap((league) => {
    const entries = season.entries.filter((entry) => entry.leagueId === LEAGUE_SLUG_TO_ID[league])
    return season.finishedEvents.map((event) => ({
      league,
      event,
      scores: weekScores(entries, event),
    }))
  }).filter((week) => week.scores.length > 0)

  const goals = await goalsForTiedWeeks(weeks)

  const verdicts: GameweekVerdict[] = weeks.flatMap((week) => {
    const results: LeagueGameweekResult[] = week.scores.map(({ entry, points }) => ({
      person: personFor(entry),
      points,
      goals: goals.get(goalsKey(entry.entryApiId, week.event)) ?? 0,
      tableRank: tableRanks.get(entry.entryApiId) ?? UNRANKED,
    }))
    const loser = resolveGameweekLoser(results)

    return loser
      ? [{ event: week.event, league: week.league, loser, players: results.map((r) => r.person) }]
      : []
  })

  const streaks = foldSurvivalStreaks(baselines, verdicts, {
    currentSeason: CURRENT_SEASON,
    finalGameweek: season.stopEvent,
  })

  if (season.finishedEvents.includes(season.stopEvent))
    await bakeSeasonBaseline(streaks, season.stopEvent)

  return streaks
}
