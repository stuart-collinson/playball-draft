import type { LeagueSlug } from "@pbd/lib/constants/fpl"

export type SurvivalBaseline = {
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
