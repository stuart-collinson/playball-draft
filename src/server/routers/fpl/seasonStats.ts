import {
  computeAllPlayTable,
  computePairwiseGrids,
  computeRivalExtremes,
} from "@pbd/lib/fpl/allPlay"
import { computeScoreDistribution } from "@pbd/lib/fpl/scoreDistribution"
import { computeStreaks } from "@pbd/lib/fpl/streaks"
import { round1 } from "@pbd/lib/utils/fmt"
import { fetchBenchPoints } from "@pbd/server/fpl/benchPoints"
import { fetchSeasonScores } from "@pbd/server/fpl/seasonScores"
import type { SeasonEntry } from "@pbd/server/fpl/seasonScores"
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
  allPlayTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const meta = buildMetaLookup(season.entries)
    return computeAllPlayTable(season.entries).map((row) => ({
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
    const benchByEntry = await fetchBenchPoints(season.entries, season.finishedEvents)
    return season.entries.map((entry) => {
      const benchRows = benchByEntry.get(entry.entryApiId) ?? []
      const benchTotal = benchRows.reduce((sum, row) => sum + row.benchPoints, 0)
      const startingTotal = entry.rows.reduce((sum, row) => sum + row.points, 0)
      const played = entry.rows.length
      const worst = benchRows.reduce(
        (acc, row) => (row.benchPoints > acc.benchPoints ? row : acc),
        { event: 0, benchPoints: 0 },
      )
      const squadTotal = startingTotal + benchTotal
      return {
        ...meta(entry.entryApiId),
        benchTotal,
        benchAvg: played === 0 ? 0 : round1(benchTotal / played),
        worstEvent: worst.event,
        worstPoints: worst.benchPoints,
        efficiencyPct: squadTotal === 0 ? 100 : round1((startingTotal / squadTotal) * 100),
      }
    })
  }),

  formTable: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const season = await fetchSeasonScores(input.leagueIds)
    const meta = buildMetaLookup(season.entries)
    const recent = season.entries.map((entry) => ({
      ...entry,
      rows: entry.rows.slice(-FORM_WINDOW),
    }))
    const playedByEntry = new Map(recent.map((entry) => [entry.entryApiId, entry.rows.length]))
    return computeAllPlayTable(recent).map((row) => {
      const played = playedByEntry.get(row.entryApiId) ?? 0
      return {
        ...meta(row.entryApiId),
        formPoints: row.totalPoints,
        formAvg: played === 0 ? 0 : round1(row.totalPoints / played),
        wins: row.wins,
        draws: row.draws,
        losses: row.losses,
        played,
      }
    })
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
    const projections = season.entries.map((entry) => {
      const total = entry.rows.reduce((sum, row) => sum + row.points, 0)
      const played = entry.rows.length
      const ppg = played === 0 ? 0 : total / played
      return { entry, total, ppg, projected: Math.round(ppg * season.stopEvent) }
    })
    const topProjected = projections.reduce((max, row) => Math.max(max, row.projected), 0)
    return projections.map(({ entry, total, ppg, projected }) => ({
      ...meta(entry.entryApiId),
      totalPoints: total,
      ppg: round1(ppg),
      projectedTotal: projected,
      gapToTopPace: topProjected - projected,
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
