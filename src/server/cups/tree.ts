import "server-only"

import { CURRENT_SEASON } from "@pbd/lib/constants/App"
import { FPL_ENDPOINTS, LEAGUE_SLUGS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/Fpl"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/Participants"
import {
  cupBakeRows,
  cupFinalResult,
  cupStatusFor,
  currentCupRound,
  foldCupTies,
  levelTieGameweeks,
} from "@pbd/lib/cups/bracket"
import type { CupBakeRow, CupFoldContext } from "@pbd/lib/cups/bracket"
import { canCreateCup } from "@pbd/lib/cups/schedule"
import { firstOpenEventId } from "@pbd/lib/fpl/gamePhase"
import { personSlug } from "@pbd/lib/people"
import { bakeCupTies, findCup, listCupTies, listCups } from "@pbd/server/cups/repository"
import { fetchBootstrapStatic } from "@pbd/server/fpl/bootstrap"
import { SERVER_TTL, fetchFpl } from "@pbd/server/fpl/client"
import { fetchSeasonScores } from "@pbd/server/fpl/seasonScores"
import type { SeasonEntry } from "@pbd/server/fpl/seasonScores"
import { fetchSquadWeekStats } from "@pbd/server/fpl/squadWeeks"
import type {
  Cup,
  CupScheduleWindow,
  CupSummary,
  CupTie,
  CupTieRow,
  ResolvedCup,
} from "@pbd/types/cups.types"
import type { FplGame } from "@pbd/types/fpl.types"

const LEAGUE_IDS_IN_ORDER = LEAGUE_SLUGS.map((slug) => LEAGUE_SLUG_TO_ID[slug])

const MAX_TIEBREAK_PASSES = 3

type SeasonData = {
  finishedGameweeks: number[]
  currentGameweek: number | null
  points: Map<string, number>
  seasonPoints: Map<string, number>
  entries: { entryApiId: number; entryId: number }[]
  personByApiId: Map<number, string>
}

type ResolvedEntry = {
  cup: Cup
  rows: CupTieRow[]
  ties: CupTie[]
  isCurrentSeason: boolean
  currentGameweek: number | null
}

const scoreKey = (person: string, gameweek: number): string => `${person}:${gameweek}`

const personFor = (entry: SeasonEntry): string =>
  personSlug(PARTICIPANT_BY_API_ID[entry.entryApiId]?.name ?? entry.managerName)

const loadSeasonData = async (): Promise<SeasonData> => {
  const [season, game] = await Promise.all([
    fetchSeasonScores(LEAGUE_IDS_IN_ORDER),
    fetchFpl<FplGame>(FPL_ENDPOINTS.game(), SERVER_TTL.GAME),
  ])

  const points = new Map<string, number>()
  const seasonPoints = new Map<string, number>()
  const personByApiId = new Map<number, string>()

  for (const entry of season.entries) {
    const person = personFor(entry)
    personByApiId.set(entry.entryApiId, person)

    for (const row of entry.rows) {
      points.set(scoreKey(person, row.event), row.points)
      seasonPoints.set(scoreKey(person, row.event), row.totalPoints)
    }
  }

  return {
    finishedGameweeks: season.finishedEvents,
    currentGameweek: game.current_event,
    points,
    seasonPoints,
    entries: season.entries.map(({ entryApiId, entryId }) => ({ entryApiId, entryId })),
    personByApiId,
  }
}

const loadGoals = async (
  seasonData: SeasonData,
  gameweeks: number[],
  goals: Map<string, number>,
): Promise<void> => {
  const statsByEntry = await fetchSquadWeekStats(seasonData.entries, gameweeks)

  for (const [entryApiId, weeks] of statsByEntry) {
    const person = seasonData.personByApiId.get(entryApiId)
    if (!person) continue

    for (const week of weeks) goals.set(scoreKey(person, week.event), week.starterGoals)
  }
}

const buildContext = (
  cup: Cup,
  seasonData: SeasonData | null,
  goals: Map<string, number>,
): CupFoldContext => ({
  format: cup.format,
  schedule: cup.schedule,
  drawSeed: cup.drawSeed,
  finishedGameweeks: seasonData?.finishedGameweeks ?? [],
  currentGameweek: seasonData?.currentGameweek ?? null,
  pointsFor: (person, gameweek) => seasonData?.points.get(scoreKey(person, gameweek)) ?? null,
  goalsFor: (person, gameweek) => goals.get(scoreKey(person, gameweek)) ?? 0,
  seasonPointsFor: (person, gameweek) =>
    seasonData?.seasonPoints.get(scoreKey(person, gameweek)) ?? null,
})

const foldCup = async (
  cup: Cup,
  rows: CupTieRow[],
  seasonData: SeasonData | null,
): Promise<CupTie[]> => {
  const goals = new Map<string, number>()
  const fetched = new Set<number>()
  let ties = foldCupTies(rows, buildContext(cup, seasonData, goals))
  if (!seasonData) return ties

  for (let pass = 0; pass < MAX_TIEBREAK_PASSES; pass += 1) {
    const needed = levelTieGameweeks(ties).filter((gameweek) => !fetched.has(gameweek))
    if (needed.length === 0) break

    for (const gameweek of needed) fetched.add(gameweek)
    await loadGoals(seasonData, needed, goals)
    ties = foldCupTies(rows, buildContext(cup, seasonData, goals))
  }

  return ties
}

const isFullyBaked = (rows: CupTieRow[]): boolean =>
  rows.length > 0 && rows.every((row) => row.winner !== null)

const bake = async (rows: CupBakeRow[]): Promise<void> => {
  if (rows.length === 0) return

  try {
    await bakeCupTies(rows)
  } catch (error) {
    console.error("[cups] failed to bake settled ties", error)
  }
}

const resolveCups = async (cups: Cup[]): Promise<ResolvedEntry[]> => {
  if (cups.length === 0) return []

  const tiesByCup = await listCupTies(cups.map((cup) => cup.id))
  const needsSeasonData = cups.some(
    (cup) => cup.season === CURRENT_SEASON && !isFullyBaked(tiesByCup.get(cup.id) ?? []),
  )
  const seasonData = needsSeasonData ? await loadSeasonData() : null

  const resolved = await Promise.all(
    cups.map(async (cup) => {
      const rows = tiesByCup.get(cup.id) ?? []
      const isCurrentSeason = cup.season === CURRENT_SEASON

      return {
        cup,
        rows,
        isCurrentSeason,
        currentGameweek: isCurrentSeason ? (seasonData?.currentGameweek ?? null) : null,
        ties: await foldCup(cup, rows, isCurrentSeason ? seasonData : null),
      }
    }),
  )

  await bake(
    resolved.flatMap((entry) => (entry.isCurrentSeason ? cupBakeRows(entry.rows, entry.ties) : [])),
  )

  return resolved
}

const toSummary = (entry: ResolvedEntry): CupSummary => ({
  id: entry.cup.id,
  season: entry.cup.season,
  name: entry.cup.name,
  format: entry.cup.format,
  schedule: entry.cup.schedule,
  status: cupStatusFor(entry.ties, entry.isCurrentSeason),
  currentRound: currentCupRound(entry.ties),
  final: cupFinalResult(entry.ties),
  createdAt: entry.cup.createdAt,
})

export const resolveCupSummaries = async (): Promise<CupSummary[]> => {
  const resolved = await resolveCups(await listCups())

  return resolved.map(toSummary)
}

export const resolveCupDetail = async (cupId: string): Promise<ResolvedCup | null> => {
  const cup = await findCup(cupId)
  if (!cup) return null

  const entry = (await resolveCups([cup]))[0]
  if (!entry) return null

  return {
    cup: entry.cup,
    status: cupStatusFor(entry.ties, entry.isCurrentSeason),
    currentRound: currentCupRound(entry.ties),
    currentGameweek: entry.currentGameweek,
    ties: entry.ties,
  }
}

export const resolveFirstOpenGameweek = async (): Promise<number | null> => {
  const bootstrap = await fetchBootstrapStatic()

  return firstOpenEventId(bootstrap.events.data, new Date())
}

export const resolveScheduleWindow = async (): Promise<CupScheduleWindow> => {
  const firstOpenGameweek = await resolveFirstOpenGameweek()

  return {
    firstOpenGameweek,
    knockout: canCreateCup("knockout", firstOpenGameweek),
    twoLegs: canCreateCup("two_legs", firstOpenGameweek),
  }
}
