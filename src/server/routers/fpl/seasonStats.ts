import { computeBenchWaste } from "@pbd/lib/fpl/benchWaste"
import { computeFormTable } from "@pbd/lib/fpl/form"
import { computePaceRows } from "@pbd/lib/fpl/pace"
import {
  computePairwiseGrids,
  computeRivalExtremes,
  computeRoundRobinTable,
} from "@pbd/lib/fpl/roundRobin"
import { computeScoreDistribution } from "@pbd/lib/fpl/scoreDistribution"
import { sumSquadReturns } from "@pbd/lib/fpl/squadReturns"
import { computeStreaks } from "@pbd/lib/fpl/streaks"
import { fetchSeasonScores } from "@pbd/server/fpl/seasonScores"
import type { SeasonEntry } from "@pbd/server/fpl/seasonScores"
import { fetchSquadWeekStats } from "@pbd/server/fpl/squadWeeks"
import { leagueIdsInput } from "@pbd/server/routers/fpl/inputs"
import { publicProcedure } from "@pbd/server/trpc"
import type { TRPCRouterRecord } from "@trpc/server"

const FORM_WINDOW = 6

type EntryMeta = { entryApiId: number; leagueId: number; managerName: string; teamName: string }

const buildMetaLookup = (entries: SeasonEntry[]): ((entryApiId: number) => EntryMeta) => {
  const byId = new Map(
    entries.map((entry) => [
      entry.entryApiId,
      {
        entryApiId: entry.entryApiId,
        leagueId: entry.leagueId,
        managerName: entry.managerName,
        teamName: entry.teamName,
      },
    ]),
  )
  return (entryApiId) =>
    byId.get(entryApiId) ?? {
      entryApiId,
      leagueId: 0,
      managerName: `Entry ${entryApiId}`,
      teamName: "",
    }
}

export const seasonStatsProcedures = {
  roundRobinTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const meta = buildMetaLookup(season.entries)
    return computeRoundRobinTable(season.entries).map((row) => ({
      ...meta(row.entryApiId),
      ...row,
    }))
  }),

  scoreDistributionTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const meta = buildMetaLookup(season.entries)
    return season.entries.map((entry) => ({
      ...meta(entry.entryApiId),
      ...computeScoreDistribution(entry.rows.map((row) => row.points)),
    }))
  }),

  benchTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const meta = buildMetaLookup(season.entries)
    const benchByEntry = await fetchSquadWeekStats(season.entries, season.finishedEvents)
    return season.entries.map((entry) => ({
      ...meta(entry.entryApiId),
      ...computeBenchWaste(
        benchByEntry.get(entry.entryApiId) ?? [],
        entry.rows.reduce((sum, row) => sum + row.points, 0),
        entry.rows.length,
      ),
    }))
  }),

  squadReturns: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const meta = buildMetaLookup(season.entries)
    const weeksByEntry = await fetchSquadWeekStats(season.entries, season.finishedEvents)
    return season.entries.map((entry) => ({
      ...meta(entry.entryApiId),
      ...sumSquadReturns(weeksByEntry.get(entry.entryApiId) ?? []),
    }))
  }),

  formTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const meta = buildMetaLookup(season.entries)
    return computeFormTable(season.entries, FORM_WINDOW).map((row) => ({
      ...meta(row.entryApiId),
      ...row,
    }))
  }),

  streaksTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const meta = buildMetaLookup(season.entries)
    return computeStreaks(season.entries).map((row) => ({
      ...meta(row.entryApiId),
      ...row,
    }))
  }),

  paceTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const meta = buildMetaLookup(season.entries)
    return computePaceRows(season.entries, season.stopEvent).map((row) => ({
      ...meta(row.entryApiId),
      ...row,
    }))
  }),

  rivalryGrid: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const meta = buildMetaLookup(season.entries)
    return computePairwiseGrids(season.entries).map((grid) => ({
      leagueId: grid.leagueId,
      managers: grid.order.map((entryApiId) => ({
        entryApiId,
        managerName: meta(entryApiId).managerName,
        teamName: meta(entryApiId).teamName,
      })),
      cells: grid.cells,
      extremes: computeRivalExtremes(grid),
    }))
  }),
} satisfies TRPCRouterRecord
