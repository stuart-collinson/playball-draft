import "server-only"

import { CURRENT_SEASON } from "@pbd/lib/constants/App"
import { LEAGUE_SLUGS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/Fpl"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/Participants"
import { personSlug } from "@pbd/lib/people"
import {
  pendingGameweeks,
  summariseSurvivalStreaks,
  survivalOutcomes,
} from "@pbd/lib/survival/streaks"
import { fetchBootstrapStatic, finishedEventIds } from "@pbd/server/fpl/bootstrap"
import { fetchGameweekVerdicts } from "@pbd/server/fpl/gameweekVerdicts"
import type { SeasonEntry } from "@pbd/server/fpl/seasonScores"
import { listSurvivalRecords, recordSurvivalGameweek } from "@pbd/server/survival/repository"
import type { SurvivalStreaks } from "@pbd/types/survival.types"

const LEAGUE_IDS_IN_ORDER = LEAGUE_SLUGS.map((slug) => LEAGUE_SLUG_TO_ID[slug])

const personFor = (entry: SeasonEntry): string =>
  personSlug(PARTICIPANT_BY_API_ID[entry.entryApiId]?.name ?? entry.managerName)

const fetchFinishedGameweeks = async (): Promise<number[]> => {
  try {
    return finishedEventIds(await fetchBootstrapStatic())
  } catch (error) {
    console.error("[survival] could not check fpl for finished gameweeks", error)
    return []
  }
}

const writeGameweeks = async (gameweeks: number[]): Promise<void> => {
  const { verdicts, season } = await fetchGameweekVerdicts(LEAGUE_IDS_IN_ORDER)
  const personByApiId = new Map(
    season.entries.map((entry) => [entry.entryApiId, personFor(entry)] as const),
  )

  for (const gameweek of gameweeks) {
    const outcomes = verdicts
      .filter((verdict) => verdict.event === gameweek)
      .flatMap((verdict) =>
        survivalOutcomes(verdict, (entryApiId) => personByApiId.get(entryApiId)),
      )
    await recordSurvivalGameweek(CURRENT_SEASON, gameweek, outcomes)
  }
}

const recordGameweeks = async (gameweeks: number[]): Promise<void> => {
  try {
    await writeGameweeks(gameweeks)
  } catch (error) {
    console.error(`[survival] failed to record gameweeks ${gameweeks.join(", ")}`, error)
  }
}

export const resolveSurvivalStreaks = async (): Promise<SurvivalStreaks> => {
  const records = await listSurvivalRecords()
  const gameweeks = pendingGameweeks(records, await fetchFinishedGameweeks(), CURRENT_SEASON)
  if (gameweeks.length === 0) return summariseSurvivalStreaks(records, CURRENT_SEASON)

  await recordGameweeks(gameweeks)

  return summariseSurvivalStreaks(await listSurvivalRecords(), CURRENT_SEASON)
}
