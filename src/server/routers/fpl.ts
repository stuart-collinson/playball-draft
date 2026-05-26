import { CACHE_TTL, FPL_ENDPOINTS } from "@pbd/lib/constants/fpl";
import {
  PARTICIPANT_BY_API_ID,
  PARTICIPANT_BY_ENTRY_ID,
} from "@pbd/lib/constants/participants";
import { createTRPCRouter, publicProcedure } from "@pbd/server/trpc";
import type {
  BootstrapStaticResponse,
  DraftChoicesResponse,
  ElementSummaryResponse,
  EntryEventPicksResponse,
  EntryHistoryResponse,
  EventLiveResponse,
  LeagueDetailsResponse,
  Trade,
  TradesResponse,
  Transaction,
  TransactionsResponse,
} from "@pbd/types/fpl.types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

type GwCountsEntry = {
  rank: number;
  managerName: string;
  teamName: string;
  entryApiId: number;
  gwWins: number;
  gwLosses: number;
};

type GwLeaderboardEntry = {
  rank: number;
  managerName: string;
  teamName: string;
  event: number;
  points: number;
  entryApiId: number;
  leagueId: number;
};

type PositionHistoryEntry = {
  entryApiId: number;
  leagueId: number;
  managerName: string;
  teamName: string;
  history: { event: number; position: number; totalPoints: number }[];
};

type BestWaiverEntry = {
  playerName: string;
  playerTeam: string;
  managerName: string;
  teamName: string;
  acquiredEvent: number;
  droppedEvent: number | null;
  points: number;
  avgPoints: number;
  gwsOwned: number;
  entryApiId: number;
  leagueId: number;
  kind: "w" | "f";
};

type BestTradeEntry = {
  playerName: string;
  playerTeam: string;
  managerName: string;
  teamName: string;
  acquiredEvent: number;
  droppedEvent: number | null;
  points: number;
  avgPoints: number;
  gwsOwned: number;
  entryApiId: number;
  leagueId: number;
};

type TradeDropRecord = { element: number; entryId: number; event: number };

const buildTradeDrops = (trades: Trade[]): TradeDropRecord[] => {
  const drops: TradeDropRecord[] = [];
  for (const trade of trades) {
    for (const item of trade.tradeitem_set) {
      drops.push({
        element: item.element_out,
        entryId: trade.offered_entry,
        event: trade.event,
      });
      drops.push({
        element: item.element_in,
        entryId: trade.received_entry,
        event: trade.event,
      });
    }
  }
  return drops;
};

const findOwnershipEnd = (
  elementId: number,
  entryId: number,
  startGw: number,
  transactions: Transaction[],
  tradeDrops: TradeDropRecord[],
  currentEvent: number,
): number => {
  // Use >= startGw so same-GW drops (pick up and drop in the same waiver window) are detected
  const txDrop = transactions
    .filter(
      (t) =>
        t.element_out === elementId &&
        t.entry === entryId &&
        t.result === "a" &&
        t.event >= startGw,
    )
    .sort((a, b) => a.event - b.event)[0];

  const tradeDrop = tradeDrops
    .filter(
      (d) =>
        d.element === elementId && d.entryId === entryId && d.event >= startGw,
    )
    .sort((a, b) => a.event - b.event)[0];

  const txEndGw = txDrop ? txDrop.event - 1 : Infinity;
  const tradeEndGw = tradeDrop ? tradeDrop.event - 1 : Infinity;
  return Math.min(txEndGw, tradeEndGw, currentEvent);
};

type AwardEntry = {
  managerName: string;
  teamName: string;
  entryApiId: number;
  leagueId: number;
  value: number;
  extra?: string;
};

type AwardsData = {
  mostPoints: AwardEntry;
  leastPoints: AwardEntry;
  mostGwWins: AwardEntry;
  mostGwLasts: AwardEntry;
  mostRelevant: AwardEntry;
  leastRelevant: AwardEntry;
  highestGwScore: AwardEntry;
  lowestGwScore: AwardEntry;
  bestWaiver: AwardEntry;
  highestNetGain: AwardEntry;
  mostWaivers: AwardEntry;
  bestTrade: AwardEntry;
  mostTrades: AwardEntry;
  mostFreeAgents: AwardEntry;
};

const FPL_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};

const fetchFpl = async <T>(url: string, revalidate: number): Promise<T> => {
  const res = await fetch(url, {
    headers: FPL_HEADERS,
    next: { revalidate },
  });
  if (!res.ok)
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: `FPL API error: ${res.status} ${res.statusText}`,
    });
  return res.json() as Promise<T>;
};

// Bypasses Vercel data cache — use for data that must never be stale (current event detection)
const fetchFplFresh = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, {
    headers: FPL_HEADERS,
    cache: "no-store",
  });
  if (!res.ok)
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: `FPL API error: ${res.status} ${res.statusText}`,
    });
  return res.json() as Promise<T>;
};

const fetchFplSafe = async <T>(
  url: string,
  revalidate: number,
): Promise<T | null> => {
  const res = await fetch(url, {
    headers: FPL_HEADERS,
    next: { revalidate },
  });
  if (!res.ok) return null;
  return res.json() as Promise<T>;
};

const leagueIdInput = z.object({ leagueId: z.number().int().positive() });

export const fplRouter = createTRPCRouter({
  leagueDetails: publicProcedure
    .input(leagueIdInput)
    .query(
      ({ input }): Promise<LeagueDetailsResponse> =>
        fetchFpl(
          FPL_ENDPOINTS.leagueDetails(input.leagueId),
          CACHE_TTL.STANDINGS,
        ),
    ),

  draftChoices: publicProcedure
    .input(leagueIdInput)
    .query(
      ({ input }): Promise<DraftChoicesResponse> =>
        fetchFpl(
          FPL_ENDPOINTS.draftChoices(input.leagueId),
          CACHE_TTL.DRAFT_CHOICES,
        ),
    ),

  transactions: publicProcedure
    .input(leagueIdInput)
    .query(
      ({ input }): Promise<TransactionsResponse> =>
        fetchFpl(
          FPL_ENDPOINTS.transactions(input.leagueId),
          CACHE_TTL.TRANSACTIONS,
        ),
    ),

  leagueTrades: publicProcedure
    .input(leagueIdInput)
    .query(
      ({ input }): Promise<TradesResponse> =>
        fetchFpl(FPL_ENDPOINTS.trades(input.leagueId), CACHE_TTL.TRADES),
    ),

  bootstrapStatic: publicProcedure.query(
    (): Promise<BootstrapStaticResponse> =>
      fetchFpl(FPL_ENDPOINTS.bootstrapStatic(), CACHE_TTL.BOOTSTRAP),
  ),

  entryHistory: publicProcedure
    .input(z.object({ entryId: z.number().int().positive() }))
    .query(
      ({ input }): Promise<EntryHistoryResponse> =>
        fetchFpl(
          FPL_ENDPOINTS.entryHistory(input.entryId),
          CACHE_TTL.ENTRY_HISTORY,
        ),
    ),

  entryEventPicks: publicProcedure
    .input(
      z.object({
        entryId: z.number().int().positive(),
        eventId: z.number().int().positive(),
      }),
    )
    .query(
      ({ input }): Promise<EntryEventPicksResponse> =>
        fetchFpl(
          FPL_ENDPOINTS.entryEventPicks(input.entryId, input.eventId),
          CACHE_TTL.ENTRY_EVENT_PICKS,
        ),
    ),

  eventLive: publicProcedure
    .input(z.object({ eventId: z.number().int().positive() }))
    .query(
      ({ input }): Promise<EventLiveResponse> =>
        fetchFpl(FPL_ENDPOINTS.eventLive(input.eventId), CACHE_TTL.EVENT_LIVE),
    ),

  gwCountsTable: publicProcedure
    .input(
      z.object({
        leagueIds: z.array(z.number().int().positive()).min(1),
        type: z.enum(["relevancy", "gw-wins", "gw-losses"]),
      }),
    )
    .query(async ({ input }): Promise<GwCountsEntry[]> => {
      const [allDetails, bootstrap] = await Promise.all([
        Promise.all(
          input.leagueIds.map((id) =>
            fetchFpl<LeagueDetailsResponse>(
              FPL_ENDPOINTS.leagueDetails(id),
              CACHE_TTL.STANDINGS,
            ),
          ),
        ),
        fetchFpl<BootstrapStaticResponse>(
          FPL_ENDPOINTS.bootstrapStatic(),
          CACHE_TTL.BOOTSTRAP,
        ),
      ]);

      const finishedGwSet = new Set(
        bootstrap.events.data
          .filter((event) => event.finished)
          .map((event) => event.id),
      );

      const allEntriesWithLeague = allDetails.flatMap((details, index) =>
        details.league_entries.map((entry) => ({
          ...entry,
          leagueId: input.leagueIds[index] ?? input.leagueIds[0] ?? 0,
        })),
      );

      const histories = await Promise.all(
        allEntriesWithLeague.map((entry) =>
          fetchFpl<EntryHistoryResponse>(
            FPL_ENDPOINTS.entryHistory(entry.entry_id),
            CACHE_TTL.ENTRY_HISTORY,
          ),
        ),
      );

      type GwScore = {
        apiId: number;
        event: number;
        points: number;
        leagueId: number;
      };
      const allGwScores: GwScore[] = allEntriesWithLeague.flatMap(
        (entry, index) =>
          (histories[index]?.history ?? [])
            .filter((hist) => finishedGwSet.has(hist.event))
            .map((hist) => ({
              apiId: entry.id,
              event: hist.event,
              points: hist.points,
              leagueId: entry.leagueId,
            })),
      );

      const scoresByLeagueEvent = new Map<string, GwScore[]>();
      for (const score of allGwScores) {
        const key = `${score.leagueId}-${score.event}`;
        if (!scoresByLeagueEvent.has(key)) scoresByLeagueEvent.set(key, []);
        scoresByLeagueEvent.get(key)!.push(score);
      }

      const gwWins = new Map<number, number>();
      const gwLasts = new Map<number, number>();
      for (const scores of scoresByLeagueEvent.values()) {
        const max = Math.max(...scores.map((score) => score.points));
        const min = Math.min(...scores.map((score) => score.points));
        for (const score of scores) {
          if (score.points === max)
            gwWins.set(score.apiId, (gwWins.get(score.apiId) ?? 0) + 1);
          if (score.points === min)
            gwLasts.set(score.apiId, (gwLasts.get(score.apiId) ?? 0) + 1);
        }
      }

      const rows = allEntriesWithLeague.map((entry) => {
        const wins = gwWins.get(entry.id) ?? 0;
        const losses = gwLasts.get(entry.id) ?? 0;
        return {
          managerName:
            PARTICIPANT_BY_API_ID[entry.id]?.nickname ??
            PARTICIPANT_BY_API_ID[entry.id]?.name ??
            `${entry.player_first_name} ${entry.player_last_name}`,
          teamName: entry.entry_name,
          entryApiId: entry.id,
          gwWins: wins,
          gwLosses: losses,
        };
      });

      const sorted = rows.sort((a, b) => {
        if (input.type === "relevancy")
          return b.gwWins + b.gwLosses - (a.gwWins + a.gwLosses);
        if (input.type === "gw-wins") return b.gwWins - a.gwWins;
        return b.gwLosses - a.gwLosses;
      });

      return sorted.map((row, i) => ({ ...row, rank: i + 1 }));
    }),

  gwLeaderboard: publicProcedure
    .input(
      z.object({
        leagueIds: z.array(z.number().int().positive()).min(1),
        type: z.enum(["best", "worst"]),
      }),
    )
    .query(async ({ input }): Promise<GwLeaderboardEntry[]> => {
      const [allDetails, bootstrap] = await Promise.all([
        Promise.all(
          input.leagueIds.map((id) =>
            fetchFpl<LeagueDetailsResponse>(
              FPL_ENDPOINTS.leagueDetails(id),
              CACHE_TTL.STANDINGS,
            ),
          ),
        ),
        fetchFpl<BootstrapStaticResponse>(
          FPL_ENDPOINTS.bootstrapStatic(),
          CACHE_TTL.BOOTSTRAP,
        ),
      ]);

      const finishedGwSet = new Set(
        bootstrap.events.data.filter((e) => e.finished).map((e) => e.id),
      );

      const allEntriesWithLeague = allDetails.flatMap((d, i) =>
        d.league_entries.map((e) => ({
          ...e,
          leagueId: input.leagueIds[i] ?? input.leagueIds[0] ?? 0,
        })),
      );

      const histories = await Promise.all(
        allEntriesWithLeague.map((e) =>
          fetchFpl<EntryHistoryResponse>(
            FPL_ENDPOINTS.entryHistory(e.entry_id),
            CACHE_TTL.ENTRY_HISTORY,
          ),
        ),
      );

      const allScores = allEntriesWithLeague.flatMap((entry, i) =>
        (histories[i]?.history ?? [])
          .filter((h) => finishedGwSet.has(h.event))
          .map((h) => ({
            managerName:
              PARTICIPANT_BY_API_ID[entry.id]?.nickname ??
              PARTICIPANT_BY_API_ID[entry.id]?.name ??
              `${entry.player_first_name} ${entry.player_last_name}`,
            teamName: entry.entry_name,
            event: h.event,
            points: h.points,
            entryApiId: entry.id,
            leagueId: entry.leagueId,
          })),
      );

      const sorted =
        input.type === "best"
          ? allScores.sort((a, b) => b.points - a.points)
          : allScores.sort((a, b) => a.points - b.points);

      return sorted.slice(0, 20).map((entry, i) => ({ ...entry, rank: i + 1 }));
    }),

  positionHistory: publicProcedure
    .input(
      z.object({
        leagueIds: z.array(z.number().int().positive()).min(1),
      }),
    )
    .query(async ({ input }): Promise<PositionHistoryEntry[]> => {
      const [allDetails, bootstrap] = await Promise.all([
        Promise.all(
          input.leagueIds.map((id) =>
            fetchFpl<LeagueDetailsResponse>(
              FPL_ENDPOINTS.leagueDetails(id),
              CACHE_TTL.STANDINGS,
            ),
          ),
        ),
        fetchFpl<BootstrapStaticResponse>(
          FPL_ENDPOINTS.bootstrapStatic(),
          CACHE_TTL.BOOTSTRAP,
        ),
      ]);

      const finishedEvents = bootstrap.events.data
        .filter((event) => event.finished)
        .map((event) => event.id)
        .sort((a, b) => a - b);

      const allEntriesWithLeague = allDetails.flatMap((details, index) =>
        details.league_entries.map((entry) => ({
          ...entry,
          leagueId: input.leagueIds[index] ?? input.leagueIds[0] ?? 0,
        })),
      );

      const histories = await Promise.all(
        allEntriesWithLeague.map((entry) =>
          fetchFpl<EntryHistoryResponse>(
            FPL_ENDPOINTS.entryHistory(entry.entry_id),
            CACHE_TTL.ENTRY_HISTORY,
          ),
        ),
      );

      type Cumulative = {
        entryApiId: number;
        leagueId: number;
        managerName: string;
        teamName: string;
        history: { event: number; position: number; totalPoints: number }[];
      };

      const records: Cumulative[] = allEntriesWithLeague.map((entry, i) => {
        const hist = histories[i]?.history ?? [];
        const byEvent = new Map<number, number>(
          hist.map((h) => [h.event, h.total_points]),
        );
        return {
          entryApiId: entry.id,
          leagueId: entry.leagueId,
          managerName:
            PARTICIPANT_BY_API_ID[entry.id]?.nickname ??
            PARTICIPANT_BY_API_ID[entry.id]?.name ??
            `${entry.player_first_name} ${entry.player_last_name}`,
          teamName: entry.entry_name,
          history: finishedEvents.map((event) => ({
            event,
            position: 0,
            totalPoints: byEvent.get(event) ?? 0,
          })),
        };
      });

      // Compute league position per finished gameweek (by cumulative totalPoints)
      for (const leagueId of input.leagueIds) {
        const leagueRecords = records.filter((r) => r.leagueId === leagueId);
        for (let i = 0; i < finishedEvents.length; i++) {
          const sorted = leagueRecords
            .map((r) => ({
              entryApiId: r.entryApiId,
              total: r.history[i]?.totalPoints ?? 0,
            }))
            .sort((a, b) => b.total - a.total);
          sorted.forEach((s, rank) => {
            const rec = leagueRecords.find(
              (r) => r.entryApiId === s.entryApiId,
            );
            const point = rec?.history[i];
            if (point) point.position = rank + 1;
          });
        }
      }

      return records;
    }),

  bestWaivers: publicProcedure
    .input(
      z.object({
        leagueIds: z.array(z.number().int().positive()).min(1),
        sortBy: z.enum(["total", "avg"]).default("total"),
        minGws: z.number().int().nonnegative().optional(),
        maxGws: z.number().int().positive().optional(),
        limit: z.number().int().positive().default(20),
      }),
    )
    .query(async ({ input }): Promise<BestWaiverEntry[]> => {
      const [allTxData, allTradesData, allDetails, bootstrap] =
        await Promise.all([
          Promise.all(
            input.leagueIds.map((id) =>
              fetchFpl<TransactionsResponse>(
                FPL_ENDPOINTS.transactions(id),
                CACHE_TTL.TRANSACTIONS,
              ),
            ),
          ),
          Promise.all(
            input.leagueIds.map((id) =>
              fetchFpl<TradesResponse>(
                FPL_ENDPOINTS.trades(id),
                CACHE_TTL.TRADES,
              ),
            ),
          ),
          Promise.all(
            input.leagueIds.map((id) =>
              fetchFpl<LeagueDetailsResponse>(
                FPL_ENDPOINTS.leagueDetails(id),
                CACHE_TTL.STANDINGS,
              ),
            ),
          ),
          fetchFpl<BootstrapStaticResponse>(
            FPL_ENDPOINTS.bootstrapStatic(),
            CACHE_TTL.BOOTSTRAP,
          ),
        ]);

      const allTransactions = allTxData.flatMap((d) => d.transactions);
      const allTrades = allTradesData.flatMap((d) => d.trades);
      const tradeDrops = buildTradeDrops(allTrades);

      const pickups = allTransactions.filter(
        (t) => (t.kind === "w" || t.kind === "f") && t.result === "a",
      );

      const finishedGwSet = new Set(
        bootstrap.events.data.filter((e) => e.finished).map((e) => e.id),
      );
      const currentEvent = bootstrap.events.current;

      const elementMap = new Map(bootstrap.elements.map((e) => [e.id, e]));
      const teamMap = new Map(bootstrap.teams.map((t) => [t.id, t.short_name]));
      const entryNameMap = new Map(
        allDetails.flatMap((d) =>
          d.league_entries.map((e) => [e.entry_id, e.entry_name]),
        ),
      );

      const uniqueElementIds = [...new Set(pickups.map((w) => w.element_in))];

      const summaryResults = await Promise.all(
        uniqueElementIds.map((id) =>
          fetchFplSafe<ElementSummaryResponse>(
            FPL_ENDPOINTS.elementSummary(id),
            CACHE_TTL.ELEMENT_SUMMARY,
          ),
        ),
      );

      const elementGwPoints = new Map<number, Map<number, number>>();
      uniqueElementIds.forEach((id, i) => {
        const summary = summaryResults[i];
        if (!summary) return;
        const gwMap = new Map<number, number>();
        summary.history.forEach((h) => gwMap.set(h.event, h.total_points));
        elementGwPoints.set(id, gwMap);
      });

      const pickupEntries = pickups.map((pickup) => {
        const startGw = pickup.event;
        const endGw = findOwnershipEnd(
          pickup.element_in,
          pickup.entry,
          startGw,
          allTransactions,
          tradeDrops,
          currentEvent,
        );
        const droppedEvent = endGw < currentEvent ? endGw + 1 : null;

        const gwPoints = elementGwPoints.get(pickup.element_in);
        let points = 0;
        let gwsOwned = 0;
        for (let gw = startGw; gw <= endGw; gw++) {
          if (finishedGwSet.has(gw)) {
            points += gwPoints?.get(gw) ?? 0;
            gwsOwned++;
          }
        }

        const element = elementMap.get(pickup.element_in);
        const participant = PARTICIPANT_BY_ENTRY_ID[pickup.entry];

        return {
          playerName: element?.web_name ?? `#${pickup.element_in}`,
          playerTeam: element ? (teamMap.get(element.team) ?? "") : "",
          managerName:
            participant?.nickname ??
            participant?.name ??
            `Entry ${pickup.entry}`,
          teamName: entryNameMap.get(pickup.entry) ?? "",
          acquiredEvent: startGw,
          droppedEvent,
          points,
          avgPoints: gwsOwned > 0 ? points / gwsOwned : 0,
          gwsOwned,
          entryApiId: participant?.apiId ?? 0,
          leagueId: participant?.leagueId ?? input.leagueIds[0] ?? 0,
          kind: pickup.kind as "w" | "f",
        };
      });

      const filtered = pickupEntries.filter((e) => {
        if (e.gwsOwned === 0) return false;
        if (input.minGws !== undefined && e.gwsOwned < input.minGws)
          return false;
        if (input.maxGws !== undefined && e.gwsOwned > input.maxGws)
          return false;
        return true;
      });

      const sorted =
        input.sortBy === "avg"
          ? filtered.sort((a, b) => b.avgPoints - a.avgPoints)
          : filtered.sort((a, b) => b.points - a.points);

      return sorted.slice(0, input.limit);
    }),

  bestTrades: publicProcedure
    .input(
      z.object({
        leagueIds: z.array(z.number().int().positive()).min(1),
        sortBy: z.enum(["total", "avg"]).default("total"),
        minGws: z.number().int().positive().optional(),
        limit: z.number().int().positive().default(20),
      }),
    )
    .query(async ({ input }): Promise<BestTradeEntry[]> => {
      const [allTxData, allTradesData, allDetails, bootstrap] =
        await Promise.all([
          Promise.all(
            input.leagueIds.map((id) =>
              fetchFpl<TransactionsResponse>(
                FPL_ENDPOINTS.transactions(id),
                CACHE_TTL.TRANSACTIONS,
              ),
            ),
          ),
          Promise.all(
            input.leagueIds.map((id) =>
              fetchFpl<TradesResponse>(
                FPL_ENDPOINTS.trades(id),
                CACHE_TTL.TRADES,
              ),
            ),
          ),
          Promise.all(
            input.leagueIds.map((id) =>
              fetchFpl<LeagueDetailsResponse>(
                FPL_ENDPOINTS.leagueDetails(id),
                CACHE_TTL.STANDINGS,
              ),
            ),
          ),
          fetchFpl<BootstrapStaticResponse>(
            FPL_ENDPOINTS.bootstrapStatic(),
            CACHE_TTL.BOOTSTRAP,
          ),
        ]);

      const allTransactions = allTxData.flatMap((d) => d.transactions);
      const allTrades = allTradesData.flatMap((d) => d.trades);
      const tradeDrops = buildTradeDrops(allTrades);

      const finishedGwSet = new Set(
        bootstrap.events.data.filter((e) => e.finished).map((e) => e.id),
      );
      const currentEvent = bootstrap.events.current;

      const elementMap = new Map(bootstrap.elements.map((e) => [e.id, e]));
      const teamMap = new Map(bootstrap.teams.map((t) => [t.id, t.short_name]));
      const entryNameMap = new Map(
        allDetails.flatMap((d) =>
          d.league_entries.map((e) => [e.entry_id, e.entry_name]),
        ),
      );

      // Build flat list of acquisitions from each party's perspective
      type TradeAcquisition = {
        element: number;
        entryId: number;
        event: number;
      };
      const acquisitions: TradeAcquisition[] = [];
      for (const trade of allTrades) {
        for (const item of trade.tradeitem_set) {
          acquisitions.push({
            element: item.element_in,
            entryId: trade.offered_entry,
            event: trade.event,
          });
          acquisitions.push({
            element: item.element_out,
            entryId: trade.received_entry,
            event: trade.event,
          });
        }
      }

      const uniqueElementIds = [...new Set(acquisitions.map((a) => a.element))];

      const summaryResults = await Promise.all(
        uniqueElementIds.map((id) =>
          fetchFplSafe<ElementSummaryResponse>(
            FPL_ENDPOINTS.elementSummary(id),
            CACHE_TTL.ELEMENT_SUMMARY,
          ),
        ),
      );

      const elementGwPoints = new Map<number, Map<number, number>>();
      uniqueElementIds.forEach((id, i) => {
        const summary = summaryResults[i];
        if (!summary) return;
        const gwMap = new Map<number, number>();
        summary.history.forEach((h) => gwMap.set(h.event, h.total_points));
        elementGwPoints.set(id, gwMap);
      });

      const tradeEntries = acquisitions.map((acq) => {
        const startGw = acq.event;
        const endGw = findOwnershipEnd(
          acq.element,
          acq.entryId,
          startGw,
          allTransactions,
          tradeDrops,
          currentEvent,
        );
        const droppedEvent = endGw < currentEvent ? endGw + 1 : null;

        const gwPoints = elementGwPoints.get(acq.element);
        let points = 0;
        let gwsOwned = 0;
        for (let gw = startGw; gw <= endGw; gw++) {
          if (finishedGwSet.has(gw)) {
            points += gwPoints?.get(gw) ?? 0;
            gwsOwned++;
          }
        }

        const element = elementMap.get(acq.element);
        const participant = PARTICIPANT_BY_ENTRY_ID[acq.entryId];

        return {
          playerName: element?.web_name ?? `#${acq.element}`,
          playerTeam: element ? (teamMap.get(element.team) ?? "") : "",
          managerName:
            participant?.nickname ??
            participant?.name ??
            `Entry ${acq.entryId}`,
          teamName: entryNameMap.get(acq.entryId) ?? "",
          acquiredEvent: startGw,
          droppedEvent,
          points,
          avgPoints: gwsOwned > 0 ? points / gwsOwned : 0,
          gwsOwned,
          entryApiId: participant?.apiId ?? 0,
          leagueId: participant?.leagueId ?? input.leagueIds[0] ?? 0,
        };
      });

      return tradeEntries
        .filter(
          (e) =>
            e.gwsOwned > 0 && (!input.minGws || e.gwsOwned >= input.minGws),
        )
        .sort((a, b) =>
          input.sortBy === "avg"
            ? b.avgPoints - a.avgPoints
            : b.points - a.points,
        )
        .slice(0, input.limit);
    }),

  currentGwToPlay: publicProcedure
    .input(z.object({ leagueIds: z.array(z.number().int().positive()).min(1) }))
    .query(async ({ input }): Promise<Record<number, number>> => {
      const [allDetails, bootstrap] = await Promise.all([
        Promise.all(
          input.leagueIds.map((id) =>
            fetchFpl<LeagueDetailsResponse>(
              FPL_ENDPOINTS.leagueDetails(id),
              CACHE_TTL.STANDINGS,
            ),
          ),
        ),
        // Fresh fetch (no-store) — events.current changes weekly and stale data
        // causes the wrong GW's live/picks data to be loaded, making toPlay = 0
        fetchFplFresh<BootstrapStaticResponse>(FPL_ENDPOINTS.bootstrapStatic()),
      ]);

      const currentEvent = bootstrap.events.current;
      if (!currentEvent) return {};

      const liveData = await fetchFplSafe<EventLiveResponse>(
        FPL_ENDPOINTS.eventLive(currentEvent),
        CACHE_TTL.EVENT_LIVE,
      );

      const liveMinutes = new Map<number, number>(
        Object.entries(liveData?.elements ?? {}).map(([id, el]) => [
          parseInt(id, 10),
          el.stats.minutes,
        ]),
      );

      const fixturesList = Array.isArray(liveData?.fixtures)
        ? liveData.fixtures
        : [];

      const elementTeam = new Map<number, number>(
        bootstrap.elements.map((e) => [e.id, e.team]),
      );
      const elementType = new Map<number, number>(
        bootstrap.elements.map((e) => [e.id, e.element_type]),
      );

      // Count unfinished fixtures per team (handles DGW where a team plays twice)
      const teamUnfinishedCount = new Map<number, number>();
      const teamHasAnyFixture = new Set<number>();
      for (const f of fixturesList) {
        const teams = [f.team_h, f.team_a];
        for (const teamId of teams) {
          teamHasAnyFixture.add(teamId);
          if (!f.finished) {
            teamUnfinishedCount.set(
              teamId,
              (teamUnfinishedCount.get(teamId) ?? 0) + 1,
            );
          }
        }
      }

      const allEntries = allDetails.flatMap((d) => d.league_entries);
      const allStandings = allDetails.flatMap((d) =>
        d.standings.map((s) => ({ leagueEntryId: s.league_entry, ...s })),
      );

      const picksResults = await Promise.all(
        allEntries.map((e) =>
          fetchFplSafe<EntryEventPicksResponse>(
            FPL_ENDPOINTS.entryEventPicks(e.entry_id, currentEvent),
            CACHE_TTL.ENTRY_EVENT_PICKS,
          ),
        ),
      );

      const result: Record<number, number> = {};

      for (const standing of allStandings) {
        const leagueEntryId = standing.leagueEntryId;
        const entryIndex = allEntries.findIndex((e) => e.id === leagueEntryId);
        if (entryIndex === -1) continue;

        const picks = picksResults[entryIndex]?.picks ?? [];

        const starters = picks
          .filter((p) => p.position <= 11)
          .sort((a, b) => a.position - b.position);
        const bench = picks
          .filter((p) => p.position > 11)
          .sort((a, b) => a.position - b.position);
        const benchOutfield = bench.filter(
          (p) => elementType.get(p.element) !== 1,
        );
        const benchGk = bench.find((p) => elementType.get(p.element) === 1);

        let toPlay = 0;
        let outfieldBenchIdx = 0;
        let gkBenchUsed = false;

        for (const starter of starters) {
          const teamId = elementTeam.get(starter.element);
          if (!teamId || !teamHasAnyFixture.has(teamId)) continue;

          const unfinished = teamUnfinishedCount.get(teamId) ?? 0;
          const minutes = liveMinutes.get(starter.element) ?? 0;

          if (unfinished > 0) {
            // Team has fixtures still to play — count each one (handles DGW correctly)
            toPlay += unfinished;
          } else if (minutes === 0) {
            // All fixtures done, player got 0 mins — try bench substitution
            const isGk = elementType.get(starter.element) === 1;
            if (isGk) {
              if (!gkBenchUsed && benchGk) {
                gkBenchUsed = true;
                const subTeamId = elementTeam.get(benchGk.element);
                if (subTeamId)
                  toPlay += teamUnfinishedCount.get(subTeamId) ?? 0;
              }
            } else {
              const sub = benchOutfield[outfieldBenchIdx];
              outfieldBenchIdx++;
              if (sub) {
                const subTeamId = elementTeam.get(sub.element);
                if (subTeamId)
                  toPlay += teamUnfinishedCount.get(subTeamId) ?? 0;
              }
            }
          }
        }

        result[leagueEntryId] = toPlay;
      }

      return result;
    }),

  currentGwGoalsScored: publicProcedure
    .input(z.object({ leagueIds: z.array(z.number().int().positive()).min(1) }))
    .query(async ({ input }): Promise<Record<number, number>> => {
      const [allDetails, bootstrap] = await Promise.all([
        Promise.all(
          input.leagueIds.map((id) =>
            fetchFpl<LeagueDetailsResponse>(
              FPL_ENDPOINTS.leagueDetails(id),
              CACHE_TTL.STANDINGS,
            ),
          ),
        ),
        fetchFplFresh<BootstrapStaticResponse>(FPL_ENDPOINTS.bootstrapStatic()),
      ]);

      const currentEvent = bootstrap.events.current;
      if (!currentEvent) return {};

      const liveData = await fetchFplSafe<EventLiveResponse>(
        FPL_ENDPOINTS.eventLive(currentEvent),
        CACHE_TTL.EVENT_LIVE,
      );

      const elementGoals = new Map<number, number>(
        Object.entries(liveData?.elements ?? {}).map(([id, el]) => [
          parseInt(id, 10),
          el.stats.goals_scored,
        ]),
      );

      const allEntries = allDetails.flatMap((d) => d.league_entries);

      const picksResults = await Promise.all(
        allEntries.map((e) =>
          fetchFplSafe<EntryEventPicksResponse>(
            FPL_ENDPOINTS.entryEventPicks(e.entry_id, currentEvent),
            CACHE_TTL.ENTRY_EVENT_PICKS,
          ),
        ),
      );

      const result: Record<number, number> = {};

      for (let i = 0; i < allEntries.length; i++) {
        const entry = allEntries[i]!;
        const picks = picksResults[i]?.picks ?? [];
        result[entry.id] = picks
          .filter((p) => p.multiplier > 0)
          .reduce((sum, p) => sum + (elementGoals.get(p.element) ?? 0), 0);
      }

      return result;
    }),

  elementSummary: publicProcedure
    .input(z.object({ elementId: z.number().int().positive() }))
    .query(
      ({ input }): Promise<ElementSummaryResponse> =>
        fetchFpl(
          FPL_ENDPOINTS.elementSummary(input.elementId),
          CACHE_TTL.ELEMENT_SUMMARY,
        ),
    ),

  awards: publicProcedure
    .input(
      z.object({
        leagueIds: z.array(z.number().int().positive()).min(1),
      }),
    )
    .query(async ({ input }): Promise<AwardsData> => {
      // Phase 1: parallel top-level fetches
      const [allDetails, bootstrap, allTxData, allTradesData, allChoicesData] =
        await Promise.all([
          Promise.all(
            input.leagueIds.map((id) =>
              fetchFpl<LeagueDetailsResponse>(
                FPL_ENDPOINTS.leagueDetails(id),
                CACHE_TTL.STANDINGS,
              ),
            ),
          ),
          fetchFpl<BootstrapStaticResponse>(
            FPL_ENDPOINTS.bootstrapStatic(),
            CACHE_TTL.BOOTSTRAP,
          ),
          Promise.all(
            input.leagueIds.map((id) =>
              fetchFpl<TransactionsResponse>(
                FPL_ENDPOINTS.transactions(id),
                CACHE_TTL.TRANSACTIONS,
              ),
            ),
          ),
          Promise.all(
            input.leagueIds.map((id) =>
              fetchFpl<TradesResponse>(
                FPL_ENDPOINTS.trades(id),
                CACHE_TTL.TRADES,
              ),
            ),
          ),
          Promise.all(
            input.leagueIds.map((id) =>
              fetchFpl<DraftChoicesResponse>(
                FPL_ENDPOINTS.draftChoices(id),
                CACHE_TTL.DRAFT_CHOICES,
              ),
            ),
          ),
        ]);

      const allEntries = allDetails.flatMap((d, i) =>
        d.league_entries.map((e) => ({
          ...e,
          leagueId: input.leagueIds[i] ?? 0,
        })),
      );

      const allTransactions = allTxData.flatMap((d) => d.transactions);
      const allTrades = allTradesData.flatMap((d) => d.trades);
      const awardsTradeDrops = buildTradeDrops(allTrades);

      const acceptedPickups = allTransactions.filter(
        (t) => (t.kind === "w" || t.kind === "f") && t.result === "a",
      );
      const pickupElementIds = [
        ...new Set(acceptedPickups.map((t) => t.element_in)),
      ];

      type TradeAcquisition = {
        element: number;
        entryId: number;
        event: number;
      };
      const tradeAcquisitions: TradeAcquisition[] = [];
      for (const trade of allTrades) {
        for (const item of trade.tradeitem_set) {
          tradeAcquisitions.push({
            element: item.element_in,
            entryId: trade.offered_entry,
            event: trade.event,
          });
          tradeAcquisitions.push({
            element: item.element_out,
            entryId: trade.received_entry,
            event: trade.event,
          });
        }
      }
      const tradeElementIds = [
        ...new Set(tradeAcquisitions.map((a) => a.element)),
      ];
      const allElementIds = [
        ...new Set([...pickupElementIds, ...tradeElementIds]),
      ];

      // Phase 2: entry histories + all element summaries (pickups + trades) in parallel
      const [histories, summaryResults] = await Promise.all([
        Promise.all(
          allEntries.map((e) =>
            fetchFpl<EntryHistoryResponse>(
              FPL_ENDPOINTS.entryHistory(e.entry_id),
              CACHE_TTL.ENTRY_HISTORY,
            ),
          ),
        ),
        Promise.all(
          allElementIds.map((id) =>
            fetchFplSafe<ElementSummaryResponse>(
              FPL_ENDPOINTS.elementSummary(id),
              CACHE_TTL.ELEMENT_SUMMARY,
            ),
          ),
        ),
      ]);

      const finishedGws = new Set(
        bootstrap.events.data.filter((e) => e.finished).map((e) => e.id),
      );
      const currentEvent = bootstrap.events.current;
      const elementMap = new Map(bootstrap.elements.map((e) => [e.id, e]));

      const entryApiIdToLeagueId = new Map(
        allEntries.map((e) => [e.id, e.leagueId]),
      );

      const resolveManager = (apiId: number, entryName: string) => {
        const p = PARTICIPANT_BY_API_ID[apiId];
        return {
          managerName: p?.nickname ?? p?.name ?? entryName,
          teamName: entryName,
          entryApiId: apiId,
          leagueId: entryApiIdToLeagueId.get(apiId) ?? input.leagueIds[0] ?? 0,
        };
      };

      // ── 1. Most / Least Points ────────────────────────────────────────────
      const standingsFlat = allDetails.flatMap((d) =>
        d.standings.map((s) => {
          const entry = d.league_entries.find((e) => e.id === s.league_entry);
          return {
            ...resolveManager(s.league_entry, entry?.entry_name ?? "Unknown"),
            total: s.total,
          };
        }),
      );
      const byTotal = [...standingsFlat].sort((a, b) => b.total - a.total);
      const mostPoints: AwardEntry = {
        ...byTotal[0]!,
        value: byTotal[0]!.total,
      };
      const leastPoints: AwardEntry = {
        ...byTotal[byTotal.length - 1]!,
        value: byTotal[byTotal.length - 1]!.total,
      };

      // ── 2. GW wins / GW lasts ────────────────────────────────────────────
      // GW wins/lasts are computed per-league: for each GW, the highest scorer
      // within their own league wins. This means combined mode sums per-league
      // wins rather than requiring a manager to beat all leagues simultaneously.
      type GwScore = {
        apiId: number;
        event: number;
        points: number;
        leagueId: number;
      };
      const allGwScores: GwScore[] = allEntries.flatMap((entry, i) =>
        (histories[i]?.history ?? [])
          .filter((h) => finishedGws.has(h.event))
          .map((h) => ({
            apiId: entry.id,
            event: h.event,
            points: h.points,
            leagueId: entry.leagueId,
          })),
      );

      // Group by league + event so each GW produces one winner per league
      const scoresByLeagueEvent = new Map<string, GwScore[]>();
      for (const s of allGwScores) {
        const key = `${s.leagueId}-${s.event}`;
        if (!scoresByLeagueEvent.has(key)) scoresByLeagueEvent.set(key, []);
        scoresByLeagueEvent.get(key)!.push(s);
      }

      const gwWins = new Map<number, number>();
      const gwLasts = new Map<number, number>();
      for (const scores of scoresByLeagueEvent.values()) {
        const max = Math.max(...scores.map((s) => s.points));
        const min = Math.min(...scores.map((s) => s.points));
        for (const s of scores) {
          if (s.points === max)
            gwWins.set(s.apiId, (gwWins.get(s.apiId) ?? 0) + 1);
          if (s.points === min)
            gwLasts.set(s.apiId, (gwLasts.get(s.apiId) ?? 0) + 1);
        }
      }

      const topGwWinApiId = [...gwWins.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0]!;
      const topGwLastApiId = [...gwLasts.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0]!;

      const gwWinEntry = allEntries.find((e) => e.id === topGwWinApiId[0])!;
      const gwLastEntry = allEntries.find((e) => e.id === topGwLastApiId[0])!;
      const mostGwWins: AwardEntry = {
        ...resolveManager(gwWinEntry.id, gwWinEntry.entry_name),
        value: topGwWinApiId[1],
      };
      const mostGwLasts: AwardEntry = {
        ...resolveManager(gwLastEntry.id, gwLastEntry.entry_name),
        value: topGwLastApiId[1],
      };

      // ── 2b. Most / Least Relevant (GW wins + GW losses combined) ─────────
      const relevancyByApiId = new Map<number, number>();
      for (const entry of allEntries) {
        const wins = gwWins.get(entry.id) ?? 0;
        const losses = gwLasts.get(entry.id) ?? 0;
        relevancyByApiId.set(entry.id, wins + losses);
      }
      const sortedByRelevancy = [...relevancyByApiId.entries()].sort(
        (a, b) => b[1] - a[1],
      );
      const topRelevantApiId = sortedByRelevancy[0]!;
      const bottomRelevantApiId =
        sortedByRelevancy[sortedByRelevancy.length - 1]!;
      const topRelevantEntry = allEntries.find(
        (entry) => entry.id === topRelevantApiId[0],
      )!;
      const bottomRelevantEntry = allEntries.find(
        (entry) => entry.id === bottomRelevantApiId[0],
      )!;
      const mostRelevant: AwardEntry = {
        ...resolveManager(topRelevantEntry.id, topRelevantEntry.entry_name),
        value: topRelevantApiId[1],
      };
      const leastRelevant: AwardEntry = {
        ...resolveManager(
          bottomRelevantEntry.id,
          bottomRelevantEntry.entry_name,
        ),
        value: bottomRelevantApiId[1],
      };

      // ── 3. Highest / Lowest single GW score ──────────────────────────────
      const sortedScores = [...allGwScores].sort((a, b) => b.points - a.points);
      const highestRaw = sortedScores[0]!;
      const lowestRaw = sortedScores[sortedScores.length - 1]!;
      const highestEntry = allEntries.find((e) => e.id === highestRaw.apiId)!;
      const lowestEntry = allEntries.find((e) => e.id === lowestRaw.apiId)!;
      const highestGwScore: AwardEntry = {
        ...resolveManager(highestEntry.id, highestEntry.entry_name),
        value: highestRaw.points,
        extra: `GW${highestRaw.event}`,
      };
      const lowestGwScore: AwardEntry = {
        ...resolveManager(lowestEntry.id, lowestEntry.entry_name),
        value: lowestRaw.points,
        extra: `GW${lowestRaw.event}`,
      };

      // ── 4. Best Pickup (waivers + FAs, total pts during ownership) ──────────
      const elementGwPoints = new Map<number, Map<number, number>>();
      allElementIds.forEach((id, i) => {
        const summary = summaryResults[i];
        if (!summary) return;
        const gwMap = new Map<number, number>();
        summary.history.forEach((h) => gwMap.set(h.event, h.total_points));
        elementGwPoints.set(id, gwMap);
      });

      const pickupScored = acceptedPickups.map((pickup) => {
        const ownerEntry = allEntries.find((e) => e.entry_id === pickup.entry);
        if (!ownerEntry) return null;

        const startGw = pickup.event;
        const endGw = findOwnershipEnd(
          pickup.element_in,
          pickup.entry,
          startGw,
          allTransactions,
          awardsTradeDrops,
          currentEvent,
        );
        const gwPoints = elementGwPoints.get(pickup.element_in);
        let points = 0;
        for (let gw = startGw; gw <= endGw; gw++) {
          if (finishedGws.has(gw)) points += gwPoints?.get(gw) ?? 0;
        }

        const element = elementMap.get(pickup.element_in);
        return {
          ...resolveManager(ownerEntry.id, ownerEntry.entry_name),
          value: points,
          extra: element?.web_name ?? `#${pickup.element_in}`,
        };
      });

      const bestWaiverRaw = pickupScored
        .filter((w): w is NonNullable<typeof w> => w !== null)
        .sort((a, b) => b.value - a.value)[0];

      const bestWaiver: AwardEntry = bestWaiverRaw ?? {
        managerName: "—",
        teamName: "—",
        entryApiId: 0,
        leagueId: input.leagueIds[0] ?? 0,
        value: 0,
      };

      // ── 4b. Best Trade (total pts during ownership) ───────────────────────
      const tradeScored = tradeAcquisitions.map((acq) => {
        const ownerEntry = allEntries.find((e) => e.entry_id === acq.entryId);
        if (!ownerEntry) return null;
        const startGw = acq.event;
        const endGw = findOwnershipEnd(
          acq.element,
          acq.entryId,
          startGw,
          allTransactions,
          awardsTradeDrops,
          currentEvent,
        );
        const gwPoints = elementGwPoints.get(acq.element);
        let points = 0;
        for (let gw = startGw; gw <= endGw; gw++) {
          if (finishedGws.has(gw)) points += gwPoints?.get(gw) ?? 0;
        }
        const element = elementMap.get(acq.element);
        return {
          ...resolveManager(ownerEntry.id, ownerEntry.entry_name),
          value: points,
          extra: element?.web_name ?? `#${acq.element}`,
        };
      });

      const bestTradeRaw = tradeScored
        .filter((t): t is NonNullable<typeof t> => t !== null)
        .sort((a, b) => b.value - a.value)[0];

      const bestTrade: AwardEntry = bestTradeRaw ?? {
        managerName: "—",
        teamName: "—",
        entryApiId: 0,
        leagueId: input.leagueIds[0] ?? 0,
        value: 0,
      };

      // ── 5. Highest Net Gain % ─────────────────────────────────────────────
      const entryToChoices = new Map<number, DraftChoicesResponse>();
      allDetails.forEach((d, i) => {
        const choices = allChoicesData[i];
        if (!choices) return;
        d.league_entries.forEach((e) =>
          entryToChoices.set(e.entry_id, choices),
        );
      });

      const netGains = allEntries.map((entry) => {
        const choices = entryToChoices.get(entry.entry_id);
        if (!choices) return null;
        const initialTotal = choices.choices
          .filter((c) => c.entry === entry.entry_id)
          .reduce(
            (sum, c) => sum + (elementMap.get(c.element)?.total_points ?? 0),
            0,
          );
        const currentTotal = choices.element_status
          .filter((es) => es.owner === entry.entry_id)
          .reduce(
            (sum, es) => sum + (elementMap.get(es.element)?.total_points ?? 0),
            0,
          );
        if (initialTotal === 0) return null;
        const pct = ((currentTotal - initialTotal) / initialTotal) * 100;
        return {
          ...resolveManager(entry.id, entry.entry_name),
          value: pct,
        };
      });

      const highestNetGainRaw = netGains
        .filter((n): n is NonNullable<typeof n> => n !== null)
        .sort((a, b) => b.value - a.value)[0];

      const highestNetGain: AwardEntry = highestNetGainRaw ?? {
        managerName: "—",
        teamName: "—",
        entryApiId: 0,
        leagueId: input.leagueIds[0] ?? 0,
        value: 0,
      };

      // ── 6. Most Waivers (accepted waiver transactions only) ──────────────────
      const acceptedWaiversOnly = allTransactions.filter(
        (t) => t.kind === "w" && t.result === "a",
      );
      const waiverCounts = new Map<number, number>();
      for (const t of acceptedWaiversOnly) {
        const ownerEntry = allEntries.find((e) => e.entry_id === t.entry);
        if (!ownerEntry) continue;
        waiverCounts.set(
          ownerEntry.id,
          (waiverCounts.get(ownerEntry.id) ?? 0) + 1,
        );
      }

      const topWaiverApiId = [...waiverCounts.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0]!;
      const topWaiverEntry = allEntries.find(
        (e) => e.id === topWaiverApiId[0],
      )!;
      const mostWaivers: AwardEntry = {
        ...resolveManager(topWaiverEntry.id, topWaiverEntry.entry_name),
        value: topWaiverApiId[1],
      };

      // ── 7. Most Trades ────────────────────────────────────────────────────
      const tradeCounts = new Map<number, number>();
      for (const trade of allTrades) {
        const offeredEntry = allEntries.find(
          (e) => e.entry_id === trade.offered_entry,
        );
        const receivedEntry = allEntries.find(
          (e) => e.entry_id === trade.received_entry,
        );
        if (offeredEntry)
          tradeCounts.set(
            offeredEntry.id,
            (tradeCounts.get(offeredEntry.id) ?? 0) + 1,
          );
        if (receivedEntry)
          tradeCounts.set(
            receivedEntry.id,
            (tradeCounts.get(receivedEntry.id) ?? 0) + 1,
          );
      }

      const topTradeApiId = [...tradeCounts.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0];
      const topTradeEntry = topTradeApiId
        ? allEntries.find((e) => e.id === topTradeApiId[0])
        : undefined;
      const mostTrades: AwardEntry = topTradeEntry
        ? {
            ...resolveManager(topTradeEntry.id, topTradeEntry.entry_name),
            value: topTradeApiId![1],
          }
        : {
            managerName: "—",
            teamName: "—",
            entryApiId: 0,
            leagueId: input.leagueIds[0] ?? 0,
            value: 0,
          };

      // ── 8. Most Free Agents ───────────────────────────────────────────────
      const acceptedFAs = allTransactions.filter(
        (t) => t.kind === "f" && t.result === "a",
      );
      const faCounts = new Map<number, number>();
      for (const t of acceptedFAs) {
        const ownerEntry = allEntries.find((e) => e.entry_id === t.entry);
        if (!ownerEntry) continue;
        faCounts.set(ownerEntry.id, (faCounts.get(ownerEntry.id) ?? 0) + 1);
      }

      const topFAApiId = [...faCounts.entries()].sort((a, b) => b[1] - a[1])[0];
      const topFAEntry = topFAApiId
        ? allEntries.find((e) => e.id === topFAApiId[0])
        : undefined;
      const mostFreeAgents: AwardEntry = topFAEntry
        ? {
            ...resolveManager(topFAEntry.id, topFAEntry.entry_name),
            value: topFAApiId![1],
          }
        : {
            managerName: "—",
            teamName: "—",
            entryApiId: 0,
            leagueId: input.leagueIds[0] ?? 0,
            value: 0,
          };

      return {
        mostPoints,
        leastPoints,
        mostGwWins,
        mostGwLasts,
        mostRelevant,
        leastRelevant,
        highestGwScore,
        lowestGwScore,
        bestWaiver,
        highestNetGain,
        mostWaivers,
        bestTrade,
        mostTrades,
        mostFreeAgents,
      };
    }),
});
