import { currentGwToPlayOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useLiveLeagueRecords } from "@pbd/hooks/fpl/useLiveLeagueRecords"

export const useCurrentGwToPlay = (leagueIds: number[]): { data: Record<number, number> } =>
  useLiveLeagueRecords(leagueIds, currentGwToPlayOptions)
