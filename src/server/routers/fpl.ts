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
  LeagueDetailsResponse,
  TransactionsResponse,
} from "@pbd/types/fpl.types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

type GwLeaderboardEntry = {
  rank: number;
  managerName: string;
  teamName: string;
  event: number;
  points: number;
  entryApiId: number;
  leagueId: number;
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
};

const fetchFpl = async <T>(url: string, revalidate: number): Promise<T> => {
  const res = await fetch(url, { next: { revalidate } });
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
  const res = await fetch(url, { next: { revalidate } });
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

  bestWaivers: publicProcedure
    .input(
      z.object({
        leagueIds: z.array(z.number().int().positive()).min(1),
        sortBy: z.enum(["total", "avg"]).default("total"),
      }),
    )
    .query(async ({ input }): Promise<BestWaiverEntry[]> => {
      const [allTxData, allDetails, bootstrap] = await Promise.all([
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

      const waiverPickups = allTransactions.filter(
        (t) => t.kind === "w" && t.result === "a",
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

      const uniqueElementIds = [
        ...new Set(waiverPickups.map((w) => w.element_in)),
      ];

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

      const waiverEntries = waiverPickups.map((waiver) => {
        const dropTx = allTransactions
          .filter(
            (t) =>
              t.element_out === waiver.element_in &&
              t.entry === waiver.entry &&
              t.event > waiver.event,
          )
          .sort((a, b) => a.event - b.event)[0];

        const startGw = waiver.event;
        const endGw = dropTx ? dropTx.event - 1 : currentEvent;

        const gwPoints = elementGwPoints.get(waiver.element_in);
        let points = 0;
        let gwsOwned = 0;
        for (let gw = startGw; gw <= endGw; gw++) {
          if (finishedGwSet.has(gw)) {
            points += gwPoints?.get(gw) ?? 0;
            gwsOwned++;
          }
        }

        const element = elementMap.get(waiver.element_in);
        const participant = PARTICIPANT_BY_ENTRY_ID[waiver.entry];

        return {
          playerName: element?.web_name ?? `#${waiver.element_in}`,
          playerTeam: element ? (teamMap.get(element.team) ?? "") : "",
          managerName:
            participant?.nickname ??
            participant?.name ??
            `Entry ${waiver.entry}`,
          teamName: entryNameMap.get(waiver.entry) ?? "",
          acquiredEvent: startGw,
          droppedEvent: dropTx ? dropTx.event : null,
          points,
          avgPoints: gwsOwned > 0 ? points / gwsOwned : 0,
          gwsOwned,
          entryApiId: participant?.apiId ?? 0,
          leagueId: participant?.leagueId ?? input.leagueIds[0] ?? 0,
        };
      });

      const sorted =
        input.sortBy === "avg"
          ? waiverEntries.sort((a, b) => b.avgPoints - a.avgPoints)
          : waiverEntries.sort((a, b) => b.points - a.points);

      return sorted.slice(0, 20);
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
});
