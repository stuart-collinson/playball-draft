import "server-only"

import { CURRENT_SEASON } from "@pbd/lib/constants/App"
import { LEAGUE_SLUGS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/Fpl"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/Participants"
import type { GameweekVerdict } from "@pbd/lib/fpl/gameweek/gameweekVerdicts"
import { leagueSlugForId } from "@pbd/lib/leagues"
import { personSlug } from "@pbd/lib/people"
import {
  isFplSeason,
  pendingGameweeks,
  peopleWithoutOutcomes,
  summariseSurvivalStreaks,
  survivalOutcomes,
} from "@pbd/lib/survival/streaks"
import { fetchBootstrapStatic, finishedEventIds } from "@pbd/server/fpl/bootstrap"
import { withUncachedFplReads } from "@pbd/server/fpl/client"
import { fetchGameweekVerdicts } from "@pbd/server/fpl/gameweekVerdicts"
import type { SeasonEntry } from "@pbd/server/fpl/seasonScores"
import { listSurvivalRecords, recordSurvivalGameweek } from "@pbd/server/survival/repository"
import type { SurvivalRecord, SurvivalStreaks } from "@pbd/types/survival.types"

const LEAGUE_IDS_IN_ORDER = LEAGUE_SLUGS.map((slug) => LEAGUE_SLUG_TO_ID[slug])

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

const warnAboutCoinTosses = (gameweekVerdicts: GameweekVerdict[]): void => {
  for (const verdict of gameweekVerdicts.filter((candidate) => candidate.loserNeedsCoinToss)) {
    const league = leagueSlugForId(verdict.leagueId) ?? `league ${verdict.leagueId}`
    console.warn(
      `[survival] GW${verdict.event} ${league} needs a coin toss for the loser, so nobody's streak was reset. Once it's settled, set the loser's weeks_since_loss to 0 by hand.`,
    )
  }
}

const writeGameweeks = async (
  initialRecords: SurvivalRecord[],
  gameweeks: number[],
): Promise<SurvivalRecord[]> => {
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
    const undecided = peopleWithoutOutcomes(records, outcomes, gameweek, CURRENT_SEASON)
    if (undecided.length > 0) {
      console.error(`[survival] GW${gameweek} has no result for ${undecided.join(", ")}`)
      return records
    }

    await recordSurvivalGameweek(CURRENT_SEASON, gameweek, outcomes)
    warnAboutCoinTosses(gameweekVerdicts)
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
