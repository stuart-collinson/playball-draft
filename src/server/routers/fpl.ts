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
  highestGwScore: AwardEntry;
  lowestGwScore: AwardEntry;
  bestWaiver: AwardEntry;
  highestNetGain: AwardEntry;
  mostWaivers: AwardEntry;
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
        minGws: z.number().int().nonnegative().optional(),
        maxGws: z.number().int().positive().optional(),
        limit: z.number().int().positive().default(20),
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

      const filtered = waiverEntries.filter((e) => {
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
        fetchFpl<BootstrapStaticResponse>(
          FPL_ENDPOINTS.bootstrapStatic(),
          CACHE_TTL.BOOTSTRAP,
        ),
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

      const teamHasUnfinished = new Map<number, boolean>();
      const teamAllFinished = new Map<number, boolean>();
      for (const f of fixturesList) {
        const teams = [f.team_h, f.team_a];
        for (const teamId of teams) {
          if (!f.finished) teamHasUnfinished.set(teamId, true);
          if (teamAllFinished.get(teamId) !== false)
            teamAllFinished.set(teamId, f.finished);
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
          if (!teamId) continue;
          if (!teamHasUnfinished.has(teamId) && !teamAllFinished.has(teamId))
            continue;

          const minutes = liveMinutes.get(starter.element) ?? 0;
          const allFinished = teamAllFinished.get(teamId) ?? false;

          if (minutes === 0 && !allFinished) {
            toPlay++;
          } else if (minutes === 0 && allFinished) {
            const isGk = elementType.get(starter.element) === 1;
            if (isGk) {
              if (!gkBenchUsed && benchGk) {
                gkBenchUsed = true;
                const subTeamId = elementTeam.get(benchGk.element);
                if (subTeamId && (teamHasUnfinished.get(subTeamId) ?? false))
                  toPlay++;
              }
            } else {
              const sub = benchOutfield[outfieldBenchIdx];
              outfieldBenchIdx++;
              if (sub) {
                const subTeamId = elementTeam.get(sub.element);
                if (subTeamId && (teamHasUnfinished.get(subTeamId) ?? false))
                  toPlay++;
              }
            }
          }
        }

        result[leagueEntryId] = toPlay;
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
      const [allDetails, bootstrap, allTxData, allChoicesData] =
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
      const acceptedWaivers = allTransactions.filter(
        (t) => t.kind === "w" && t.result === "a",
      );
      const waiverElementIds = [
        ...new Set(acceptedWaivers.map((t) => t.element_in)),
      ];

      // Phase 2: entry histories + waiver element summaries in parallel
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
          waiverElementIds.map((id) =>
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

      // ── 4. Best Waiver (total pts during ownership) ───────────────────────
      const elementGwPoints = new Map<number, Map<number, number>>();
      waiverElementIds.forEach((id, i) => {
        const summary = summaryResults[i];
        if (!summary) return;
        const gwMap = new Map<number, number>();
        summary.history.forEach((h) => gwMap.set(h.event, h.total_points));
        elementGwPoints.set(id, gwMap);
      });

      const waiverScored = acceptedWaivers.map((waiver) => {
        const ownerEntry = allEntries.find((e) => e.entry_id === waiver.entry);
        if (!ownerEntry) return null;

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
        for (let gw = startGw; gw <= endGw; gw++) {
          if (finishedGws.has(gw)) points += gwPoints?.get(gw) ?? 0;
        }

        const element = elementMap.get(waiver.element_in);
        return {
          ...resolveManager(ownerEntry.id, ownerEntry.entry_name),
          value: points,
          extra: element?.web_name ?? `#${waiver.element_in}`,
        };
      });

      const bestWaiverRaw = waiverScored
        .filter((w): w is NonNullable<typeof w> => w !== null)
        .sort((a, b) => b.value - a.value)[0];

      const bestWaiver: AwardEntry = bestWaiverRaw ?? {
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

      // ── 6. Most Waivers ───────────────────────────────────────────────────
      const waiverCounts = new Map<number, number>();
      for (const t of acceptedWaivers) {
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

      return {
        mostPoints,
        leastPoints,
        mostGwWins,
        mostGwLasts,
        highestGwScore,
        lowestGwScore,
        bestWaiver,
        highestNetGain,
        mostWaivers,
      };
    }),
});
