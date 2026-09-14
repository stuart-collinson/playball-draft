import { currentGwPointsOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useLiveLeagueRecords } from "@pbd/hooks/fpl/useLiveLeagueRecords"

export const useCurrentGwPoints = (leagueIds: number[]): { data: Record<number, number> } =>
  useLiveLeagueRecords(leagueIds, currentGwPointsOptions)
