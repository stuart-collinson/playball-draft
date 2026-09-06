import "server-only"

import { CURRENT_SEASON } from "@pbd/lib/constants/app"
import { LEAGUE_SLUGS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl"
import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"
import { personSlug } from "@pbd/lib/people"
import { foldSurvivalStreaks } from "@pbd/lib/survival"
import type { SurvivalVerdict } from "@pbd/lib/survival"
import { fetchGameweekVerdicts } from "@pbd/server/fpl/gameweekVerdicts"
import type { SeasonEntry } from "@pbd/server/fpl/seasonScores"
import { listSurvivalBaselines, saveSurvivalBaselines } from "@pbd/server/survival/repository"
import type { SurvivalStreaks } from "@pbd/types/survival.types"

const LEAGUE_IDS_IN_ORDER = LEAGUE_SLUGS.map((slug) => LEAGUE_SLUG_TO_ID[slug])

const leagueSlugFor = (leagueId: number): LeagueSlug | null =>
  LEAGUE_SLUGS.find((slug) => LEAGUE_SLUG_TO_ID[slug] === leagueId) ?? null

const personFor = (entry: SeasonEntry): string =>
  personSlug(PARTICIPANT_BY_API_ID[entry.entryApiId]?.name ?? entry.managerName)

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
  const [baselines, { verdicts, season }] = await Promise.all([
    listSurvivalBaselines(),
    fetchGameweekVerdicts(LEAGUE_IDS_IN_ORDER),
  ])

  const personByApiId = new Map(
    season.entries.map((entry) => [entry.entryApiId, personFor(entry)] as const),
  )

  const survivalVerdicts: SurvivalVerdict[] = verdicts.flatMap((verdict) => {
    const league = leagueSlugFor(verdict.leagueId)
    const loser = personByApiId.get(verdict.loserApiId)
    if (!league || !loser) return []

    return [
      {
        event: verdict.event,
        league,
        loser,
        players: verdict.playerApiIds.flatMap((apiId) => personByApiId.get(apiId) ?? []),
      },
    ]
  })

  const streaks = foldSurvivalStreaks(baselines, survivalVerdicts, {
    currentSeason: CURRENT_SEASON,
    finalGameweek: season.stopEvent,
  })

  if (season.finishedEvents.includes(season.stopEvent))
    await bakeSeasonBaseline(streaks, season.stopEvent)

  return streaks
}
