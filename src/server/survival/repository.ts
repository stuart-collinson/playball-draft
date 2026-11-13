import "server-only"

import { PRE_SEASON_GAMEWEEK } from "@pbd/lib/constants/App"
import { LAST_GAMEWEEK, type LeagueSlug } from "@pbd/lib/constants/Fpl"
import { getSql } from "@pbd/server/db"
import type { SurvivalOutcome, SurvivalRecord } from "@pbd/types/survival.types"

type SurvivalRow = {
  person: string
  league: LeagueSlug
  weeks_since_loss: number
  as_of_season: string
  as_of_gameweek: number
}

const SURVIVAL_COLUMNS = "person, league, weeks_since_loss, as_of_season, as_of_gameweek"

const toRecord = (row: SurvivalRow): SurvivalRecord => ({
  person: row.person,
  league: row.league,
  weeksSinceLoss: row.weeks_since_loss,
  asOfSeason: row.as_of_season,
  asOfGameweek: row.as_of_gameweek,
})

export const listSurvivalRecords = async (): Promise<SurvivalRecord[]> => {
  const rows = await getSql().query(
    `select ${SURVIVAL_COLUMNS} from survival_streaks
     where archive = false
     order by weeks_since_loss desc, person`,
    [],
  )

  return (rows as SurvivalRow[]).map(toRecord)
}

export const recordSurvivalGameweek = async (
  season: string,
  gameweek: number,
  outcomes: SurvivalOutcome[],
): Promise<void> => {
  await getSql().query(
    `update survival_streaks as streak
     set weeks_since_loss = case when outcome.lost then 0 else streak.weeks_since_loss + 1 end,
         league = outcome.league,
         as_of_season = $4::text,
         as_of_gameweek = $5::int,
         updated_at = now()
     from unnest($1::text[], $2::text[], $3::boolean[]) as outcome(person, league, lost)
     where streak.person = outcome.person
       and streak.archive = false
       and (case
              when streak.as_of_season = $4::text then streak.as_of_gameweek
              when streak.as_of_gameweek >= $7::int then $6::int
            end) = $5::int - 1`,
    [
      outcomes.map((outcome) => outcome.person),
      outcomes.map((outcome) => outcome.league),
      outcomes.map((outcome) => outcome.lost),
      season,
      gameweek,
      PRE_SEASON_GAMEWEEK,
      LAST_GAMEWEEK,
    ],
  )
}
