import "server-only"

import { CURRENT_SEASON } from "@pbd/lib/constants/App"
import { LEAGUE_SLUGS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/Fpl"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/Participants"
import { personSlug } from "@pbd/lib/people"
import {
  isFplSeason,
  pendingGameweeks,
  peopleWithoutOutcomes,
  summariseSurvivalStreaks,
  survivalOutcomes,
} from "@pbd/lib/survival/streaks"
import { fetchBootstrapStatic, finishedEventIds } from "@pbd/server/fpl/bootstrap"
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

const writeGameweeks = async (records: SurvivalRecord[], gameweeks: number[]): Promise<void> => {
  const { verdicts, season, eventsMissingPicks } = await fetchGameweekVerdicts(LEAGUE_IDS_IN_ORDER)
  const personByApiId = new Map(
    season.entries.map((entry) => [entry.entryApiId, personFor(entry)] as const),
  )

  for (const gameweek of gameweeks) {
    if (eventsMissingPicks.includes(gameweek)) {
      console.error(`[survival] GW${gameweek} tie-break picks did not load, retrying next visit`)
      return
    }

    const outcomes = verdicts
      .filter((verdict) => verdict.event === gameweek)
      .flatMap((verdict) =>
        survivalOutcomes(verdict, (entryApiId) => personByApiId.get(entryApiId)),
      )
    const undecided = peopleWithoutOutcomes(records, outcomes)
    if (undecided.length > 0) {
      console.error(`[survival] GW${gameweek} has no result for ${undecided.join(", ")}`)
      return
    }

    await recordSurvivalGameweek(CURRENT_SEASON, gameweek, outcomes)
  }
}

const recordGameweeks = async (records: SurvivalRecord[], gameweeks: number[]): Promise<void> => {
  try {
    await writeGameweeks(records, gameweeks)
  } catch (error) {
    console.error(`[survival] failed to record gameweeks ${gameweeks.join(", ")}`, error)
  }
}

export const resolveSurvivalStreaks = async (): Promise<SurvivalStreaks> => {
  const [records, finishedGameweeks] = await Promise.all([
    listSurvivalRecords(),
    fetchFinishedGameweeks(),
  ])
  const gameweeks = pendingGameweeks(records, finishedGameweeks, CURRENT_SEASON)
  if (gameweeks.length === 0) return summariseSurvivalStreaks(records, CURRENT_SEASON)

  await recordGameweeks(records, gameweeks)

  return summariseSurvivalStreaks(await listSurvivalRecords(), CURRENT_SEASON)
}
