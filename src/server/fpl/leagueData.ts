import "server-only"

import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { SERVER_TTL, fetchFplSafe } from "@pbd/server/fpl/client"
import type {
  DraftChoicesResponse,
  LeagueDetailsResponse,
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

export const fetchLeagueDetails = async (leagueId: number): Promise<LeagueDetailsResponse> =>
  (await fetchFplSafe<LeagueDetailsResponse>(
    FPL_ENDPOINTS.leagueDetails(leagueId),
    SERVER_TTL.LEAGUE_DETAILS,
  )) ?? emptyLeagueDetails(leagueId)

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
