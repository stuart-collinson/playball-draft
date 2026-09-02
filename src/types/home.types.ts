import type { LeagueOutcome } from "@pbd/lib/fpl/gameweekOutcome"
import type { ForfeitStatus } from "@pbd/lib/homeScreen"

export type HomeLeagueSnapshot = LeagueOutcome & {
  forfeit: ForfeitStatus
}

export type HomeSnapshot = {
  gameweek: number
  premiership: HomeLeagueSnapshot
  championship: HomeLeagueSnapshot
}
