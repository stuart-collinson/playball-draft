import type { LeagueSlug } from "@pbd/lib/constants/fpl"

export type LuckMoment = {
  id: string
  season: string
  gameweek: string
  league: LeagueSlug
  person: string
  title: string
  description: string
  archive: boolean
  createdAt: string
}
