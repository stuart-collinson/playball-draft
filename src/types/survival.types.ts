import type { LeagueSlug } from "@pbd/lib/constants/Fpl"

export type SurvivalRecord = {
  person: string
  league: LeagueSlug
  weeksSinceLoss: number
  asOfSeason: string
  asOfGameweek: number
}

export type SurvivalStreak = {
  person: string
  league: LeagueSlug
  weeksSinceLoss: number
}

export type SurvivalStreaks = {
  asOfSeason: string
  asOfGameweek: number
  streaks: SurvivalStreak[]
}

export type SurvivalOutcome = {
  person: string
  lost: boolean
}
