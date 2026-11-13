import "server-only"

import { CURRENT_SEASON } from "@pbd/lib/constants/App"
import {
  FPL_ENDPOINTS,
  FPL_IDLE_PROCESSING_STATUS,
  LEAGUE_IDS_IN_ORDER,
} from "@pbd/lib/constants/Fpl"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/Participants"
import type { GameweekVerdict } from "@pbd/lib/fpl/gameweek/gameweekVerdicts"
import { leagueSlugForId } from "@pbd/lib/leagues"
import { personSlug } from "@pbd/lib/people"
import {
  isFplSeason,
  pendingGameweeks,
  peopleWithMoreThanOneOutcome,
  peopleWithoutOutcomes,
  summariseSurvivalStreaks,
  survivalOutcomes,
} from "@pbd/lib/survival/streaks"
import { fetchBootstrapStatic, finishedEventIds } from "@pbd/server/fpl/bootstrap"
import { SERVER_TTL, fetchFpl, withUncachedFplReads } from "@pbd/server/fpl/client"
import { fetchGameweekVerdicts } from "@pbd/server/fpl/gameweekVerdicts"
import type { SeasonEntry } from "@pbd/server/fpl/seasonScores"
import { listSurvivalRecords, recordSurvivalGameweek } from "@pbd/server/survival/repository"
import type { FplGame } from "@pbd/types/fpl.types"
import type { SurvivalRecord, SurvivalStreaks } from "@pbd/types/survival.types"

const personFor = (entry: SeasonEntry): string =>
  personSlug(PARTICIPANT_BY_API_ID[entry.entryApiId]?.name ?? entry.managerName)

const fetchFinishedGameweeks = async (): Promise<number[]> => {
  try {
    const bootstrap = await fetchBootstrapStatic()
    if (isFplSeason(bootstrap.events.data, CURRENT_SEASON)) return finishedEventIds(bootstrap)

    console.warn(`[survival] fpl is not on ${CURRENT_SEASON} yet, so no gameweeks are recorded`)
    return []
  } catch (error) {
    console.error("[survival] could not check fpl for finished gameweeks", error)
    return []
  }
}

const warnAboutCoinTosses = (
  gameweekVerdicts: GameweekVerdict[],
  writtenPeople: string[],
  personForApiId: (entryApiId: number) => string | undefined,
): void => {
  for (const verdict of gameweekVerdicts) {
    const levelPeople = verdict.coinTossApiIds.map(
      (entryApiId) => personForApiId(entryApiId) ?? `entry ${entryApiId}`,
    )
    if (!levelPeople.some((person) => writtenPeople.includes(person))) continue

    const league = leagueSlugForId(verdict.leagueId) ?? `league ${verdict.leagueId}`
    console.warn(
      `[survival] GW${verdict.event} ${league} needs a coin toss for the loser between ${levelPeople.join(", ")}, so nobody's streak was reset. Once it's settled, set the loser's weeks_since_loss to the smaller of its current value and as_of_gameweek - ${verdict.event}.`,
    )
  }
}

const writeGameweeks = async (
  initialRecords: SurvivalRecord[],
  gameweeks: number[],
): Promise<SurvivalRecord[]> => {
  const game = await fetchFpl<FplGame>(FPL_ENDPOINTS.game(), SERVER_TTL.GAME)
  if (game.processing_status !== FPL_IDLE_PROCESSING_STATUS) {
    console.warn(
      `[survival] fpl is still processing (status ${game.processing_status}), so nothing is recorded until it's done`,
    )
    return initialRecords
  }

  const { verdicts, season, eventsMissingPicks } = await fetchGameweekVerdicts(
    LEAGUE_IDS_IN_ORDER,
    { events: gameweeks },
  )
  const personByApiId = new Map(
    season.entries.map((entry) => [entry.entryApiId, personFor(entry)] as const),
  )

  let records = initialRecords
  for (const gameweek of gameweeks) {
    if (eventsMissingPicks.includes(gameweek)) {
      console.error(`[survival] GW${gameweek} tie-break picks did not load, retrying next visit`)
      return records
    }

    const gameweekVerdicts = verdicts.filter((verdict) => verdict.event === gameweek)
    const outcomes = gameweekVerdicts.flatMap((verdict) =>
      survivalOutcomes(verdict, (entryApiId) => personByApiId.get(entryApiId)),
    )
    const repeated = peopleWithMoreThanOneOutcome(outcomes)
    if (repeated.length > 0) {
      console.error(`[survival] GW${gameweek} has more than one result for ${repeated.join(", ")}`)
      return records
    }

    const undecided = peopleWithoutOutcomes(records, outcomes, gameweek, CURRENT_SEASON)
    if (undecided.length > 0) {
      console.error(`[survival] GW${gameweek} has no result for ${undecided.join(", ")}`)
      return records
    }

    const writtenPeople = await recordSurvivalGameweek(CURRENT_SEASON, gameweek, outcomes)
    warnAboutCoinTosses(gameweekVerdicts, writtenPeople, (entryApiId) =>
      personByApiId.get(entryApiId),
    )
    records = await listSurvivalRecords()
  }

  return records
}

const recordGameweeks = async (
  records: SurvivalRecord[],
  gameweeks: number[],
): Promise<SurvivalRecord[]> => {
  try {
    return await withUncachedFplReads(() => writeGameweeks(records, gameweeks))
  } catch (error) {
    console.error(`[survival] failed to record gameweeks ${gameweeks.join(", ")}`, error)
    return listSurvivalRecords()
  }
}

export const resolveSurvivalStreaks = async (): Promise<SurvivalStreaks> => {
  const [records, finishedGameweeks] = await Promise.all([
    listSurvivalRecords(),
    fetchFinishedGameweeks(),
  ])
  const gameweeks = pendingGameweeks(records, finishedGameweeks, CURRENT_SEASON)
  if (gameweeks.length === 0) return summariseSurvivalStreaks(records, CURRENT_SEASON)

  return summariseSurvivalStreaks(await recordGameweeks(records, gameweeks), CURRENT_SEASON)
}
