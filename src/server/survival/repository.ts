import "server-only"

import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import { getSql } from "@pbd/server/db"
import type { SurvivalBaseline, SurvivalStreak } from "@pbd/types/survival.types"

type SurvivalRow = {
  person: string
  league: LeagueSlug
  weeks_since_loss: number
  as_of_season: string
  as_of_gameweek: number
}

const SURVIVAL_COLUMNS = "person, league, weeks_since_loss, as_of_season, as_of_gameweek"

const toBaseline = (row: SurvivalRow): SurvivalBaseline => ({
  person: row.person,
  league: row.league,
  weeksSinceLoss: row.weeks_since_loss,
  asOfSeason: row.as_of_season,
  asOfGameweek: row.as_of_gameweek,
})

export const listSurvivalBaselines = async (): Promise<SurvivalBaseline[]> => {
  const rows = await getSql().query(
    `select ${SURVIVAL_COLUMNS} from survival_streaks
     where archive = false
     order by weeks_since_loss desc, person`,
    [],
  )

  return (rows as SurvivalRow[]).map(toBaseline)
}

export const saveSurvivalBaselines = async (
  streaks: SurvivalStreak[],
  season: string,
  gameweek: number,
): Promise<void> => {
  await getSql().query(
    `update survival_streaks as streak
     set weeks_since_loss = baked.weeks_since_loss, as_of_gameweek = $3, updated_at = now()
     from unnest($1::text[], $2::int[]) as baked(person, weeks_since_loss)
     where streak.person = baked.person
       and streak.archive = false
       and streak.as_of_season = $4
       and streak.as_of_gameweek < $3`,
    [
      streaks.map((streak) => streak.person),
      streaks.map((streak) => streak.weeksSinceLoss),
      gameweek,
      season,
    ],
  )
}
