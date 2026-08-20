import "server-only"

import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { SERVER_TTL, fetchFplSafe } from "@pbd/server/fpl/client"
import type {
  DraftChoicesResponse,
  LeagueDetailsResponse,
  RawLeagueDetailsResponse,
  RawStanding,
  Standing,
  TradesResponse,
  TransactionsResponse,
} from "@pbd/types/fpl.types"

const emptyLeagueDetails = (leagueId: number): LeagueDetailsResponse => ({
  league: {
    admin_entry: 0,
    closed: false,
    draft_dt: "",
    draft_pick_time_limit: 0,
    draft_status: "pre",
    draft_tz_show: "",
    id: leagueId,
    ko_rounds: 0,
    make_code_public: false,
    max_entries: 0,
    min_entries: 0,
    name: "",
    scoring: "h",
    start_event: 1,
    stop_event: 38,
    trades: "a",
    transaction_mode: "not-drafted",
    variety: "x",
    drafts: [],
    is_renewed: false,
  },
  league_entries: [],
  standings: [],
})

const EMPTY_TRANSACTIONS: TransactionsResponse = { transactions: [] }

const EMPTY_TRADES: TradesResponse = { trades: [] }

const EMPTY_DRAFT_CHOICES: DraftChoicesResponse = {
  choices: [],
  idle: [],
  element_status: [],
}

const normaliseStanding = (standing: RawStanding, index: number): Standing => ({
  event_total: standing.event_total ?? 0,
  last_rank: standing.last_rank ?? 0,
  league_entry: standing.league_entry,
  rank: standing.rank ?? index + 1,
  rank_sort: standing.rank_sort ?? index + 1,
  total: standing.total ?? 0,
})

export const fetchLeagueDetails = async (leagueId: number): Promise<LeagueDetailsResponse> => {
  const raw = await fetchFplSafe<RawLeagueDetailsResponse>(
    FPL_ENDPOINTS.leagueDetails(leagueId),
    SERVER_TTL.LEAGUE_DETAILS,
  )
  if (!raw?.league) return emptyLeagueDetails(leagueId)

  return {
    league: raw.league,
    league_entries: raw.league_entries ?? [],
    standings: (raw.standings ?? []).map(normaliseStanding),
  }
}

export const fetchLeagueTransactions = async (leagueId: number): Promise<TransactionsResponse> =>
  (await fetchFplSafe<TransactionsResponse>(
    FPL_ENDPOINTS.transactions(leagueId),
    SERVER_TTL.TRANSACTIONS,
  )) ?? EMPTY_TRANSACTIONS

export const fetchLeagueTrades = async (leagueId: number): Promise<TradesResponse> =>
  (await fetchFplSafe<TradesResponse>(FPL_ENDPOINTS.trades(leagueId), SERVER_TTL.TRADES)) ??
  EMPTY_TRADES

export const fetchLeagueDraftChoices = async (leagueId: number): Promise<DraftChoicesResponse> =>
  (await fetchFplSafe<DraftChoicesResponse>(
    FPL_ENDPOINTS.draftChoices(leagueId),
    SERVER_TTL.DRAFT_CHOICES,
  )) ?? EMPTY_DRAFT_CHOICES
