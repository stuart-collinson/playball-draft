import { CACHE_TTL, FPL_ENDPOINTS } from "@pbd/lib/constants/fpl";
import { createTRPCRouter, publicProcedure } from "@pbd/server/trpc";
import type {
  BootstrapStaticResponse,
  DraftChoicesResponse,
  EntryEventPicksResponse,
  EntryHistoryResponse,
  LeagueDetailsResponse,
  TransactionsResponse,
} from "@pbd/types/fpl.types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const fetchFpl = async <T>(url: string, revalidate: number): Promise<T> => {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok)
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: `FPL API error: ${res.status} ${res.statusText}`,
    });
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
});
