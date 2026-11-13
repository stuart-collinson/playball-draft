import { currentGwReturnsOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useLiveLeagueRecords } from "@pbd/hooks/fpl/useLiveLeagueRecords"
import type { GameweekReturns } from "@pbd/types/fpl.types"

export const useCurrentGwReturns = (
  leagueIds: number[],
): { data: Record<number, GameweekReturns> } =>
  useLiveLeagueRecords(leagueIds, currentGwReturnsOptions)
