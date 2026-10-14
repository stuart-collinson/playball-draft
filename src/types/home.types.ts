import type { LeagueOutcome } from "@pbd/lib/fpl/gameweek/gameweekOutcome"
import type { ForfeitStatus } from "@pbd/lib/home/homeScreen"

export type HomeLeagueSnapshot = LeagueOutcome & {
  forfeit: ForfeitStatus
}

export type HomeSnapshot = {
  gameweek: number
  premiership: HomeLeagueSnapshot
  championship: HomeLeagueSnapshot
}

export type CupFinalSide = "one" | "two"
