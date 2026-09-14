import { currentGwGoalsAndAssistsOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useLiveLeagueRecords } from "@pbd/hooks/fpl/useLiveLeagueRecords"
import type { GoalsAndAssists } from "@pbd/types/fpl.types"

export const useCurrentGwGoalsAndAssists = (
  leagueIds: number[],
): { data: Record<number, GoalsAndAssists> } =>
  useLiveLeagueRecords(leagueIds, currentGwGoalsAndAssistsOptions)
