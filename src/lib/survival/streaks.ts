import { FINAL_GAMEWEEK, PRE_SEASON_GAMEWEEK } from "@pbd/lib/constants/App"
import type { GameweekVerdict } from "@pbd/lib/fpl/gameweek/gameweekVerdicts"
import type {
  SurvivalOutcome,
  SurvivalRecord,
  SurvivalStreak,
  SurvivalStreaks,
} from "@pbd/types/survival.types"

export type RankedSurvivalStreak = SurvivalStreak & { rank: number }

const recordedGameweek = (record: SurvivalRecord, currentSeason: string): number | null => {
  if (record.asOfSeason === currentSeason) return record.asOfGameweek
  return record.asOfGameweek >= FINAL_GAMEWEEK ? PRE_SEASON_GAMEWEEK : null
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

export const survivalOutcomes = (
  verdict: GameweekVerdict,
  personFor: (entryApiId: number) => string | undefined,
): SurvivalOutcome[] =>
  verdict.playerApiIds.flatMap((entryApiId) => {
    const person = personFor(entryApiId)
    if (!person) return []

    return [{ person, lost: entryApiId === verdict.loserApiId && !verdict.loserNeedsCoinToss }]
  })

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
