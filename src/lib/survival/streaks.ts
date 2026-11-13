import { PRE_SEASON_GAMEWEEK } from "@pbd/lib/constants/App"
import { LAST_GAMEWEEK } from "@pbd/lib/constants/Fpl"
import type { GameweekVerdict } from "@pbd/lib/fpl/gameweek/gameweekVerdicts"
import { leagueSlugForId } from "@pbd/lib/leagues"
import type { FplEvent } from "@pbd/types/fpl.types"
import type {
  SurvivalOutcome,
  SurvivalRecord,
  SurvivalStreak,
  SurvivalStreaks,
} from "@pbd/types/survival.types"

export type RankedSurvivalStreak = SurvivalStreak & { rank: number }

type SeasonEvent = Pick<FplEvent, "id" | "deadline_time">

const OPENING_GAMEWEEK = 1

const seasonStartYear = (season: string): number => Number(season.slice(0, 4))

const recordedGameweek = (record: SurvivalRecord, currentSeason: string): number | null => {
  if (record.asOfSeason === currentSeason) return record.asOfGameweek
  return record.asOfGameweek >= LAST_GAMEWEEK ? PRE_SEASON_GAMEWEEK : null
}

const isRecordedBefore = (record: SurvivalRecord, other: SurvivalRecord): boolean =>
  record.asOfSeason === other.asOfSeason
    ? record.asOfGameweek < other.asOfGameweek
    : record.asOfSeason < other.asOfSeason

export const pendingGameweeks = (
  records: SurvivalRecord[],
  finishedEvents: number[],
  currentSeason: string,
): number[] => {
  const recorded = records.flatMap((record) => recordedGameweek(record, currentSeason) ?? [])
  if (recorded.length === 0) return []

  const recordedUpTo = Math.min(...recorded)

  return finishedEvents
    .filter((event) => event > recordedUpTo)
    .sort((first, second) => first - second)
}

export const isFplSeason = (events: SeasonEvent[], season: string): boolean => {
  const opener = events.find((event) => event.id === OPENING_GAMEWEEK)
  if (!opener) return false

  return new Date(opener.deadline_time).getUTCFullYear() === seasonStartYear(season)
}

export const survivalOutcomes = (
  verdict: GameweekVerdict,
  personFor: (entryApiId: number) => string | undefined,
): SurvivalOutcome[] => {
  const league = leagueSlugForId(verdict.leagueId)
  if (!league) return []

  return verdict.playerApiIds.flatMap((entryApiId) => {
    const person = personFor(entryApiId)
    if (!person) return []

    const lost = entryApiId === verdict.loserApiId && !verdict.loserNeedsCoinToss
    return [{ person, league, lost }]
  })
}

export const peopleWithMoreThanOneOutcome = (outcomes: SurvivalOutcome[]): string[] => {
  const seen = new Set<string>()
  const repeated = new Set<string>()
  for (const outcome of outcomes) (seen.has(outcome.person) ? repeated : seen).add(outcome.person)

  return [...repeated]
}

export const peopleWithoutOutcomes = (
  records: SurvivalRecord[],
  outcomes: SurvivalOutcome[],
  gameweek: number,
  currentSeason: string,
): string[] => {
  const decided = new Set(outcomes.map((outcome) => outcome.person))

  return records
    .filter((record) => recordedGameweek(record, currentSeason) === gameweek - 1)
    .map((record) => record.person)
    .filter((person) => !decided.has(person))
}

export const summariseSurvivalStreaks = (
  records: SurvivalRecord[],
  currentSeason: string,
): SurvivalStreaks => {
  const leastRecent = records.reduce<SurvivalRecord | null>(
    (least, record) => (least === null || isRecordedBefore(record, least) ? record : least),
    null,
  )

  return {
    asOfSeason: leastRecent?.asOfSeason ?? currentSeason,
    asOfGameweek: leastRecent?.asOfGameweek ?? PRE_SEASON_GAMEWEEK,
    streaks: records.map(({ person, league, weeksSinceLoss }) => ({
      person,
      league,
      weeksSinceLoss,
    })),
  }
}

export const rankSurvivalStreaks = (streaks: SurvivalStreak[]): RankedSurvivalStreak[] => {
  const ordered = [...streaks].sort(
    (first, second) =>
      second.weeksSinceLoss - first.weeksSinceLoss || first.person.localeCompare(second.person),
  )

  return ordered.map((streak) => ({
    ...streak,
    rank: ordered.findIndex((peer) => peer.weeksSinceLoss === streak.weeksSinceLoss) + 1,
  }))
}
