import "server-only"

import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { SERVER_TTL, fetchFplSafe } from "@pbd/server/fpl/client"
import type {
  DraftChoicesResponse,
  TradesResponse,
  TransactionsResponse,
} from "@pbd/types/fpl.types"

const EMPTY_TRANSACTIONS: TransactionsResponse = { transactions: [] }

const EMPTY_TRADES: TradesResponse = { trades: [] }

const EMPTY_DRAFT_CHOICES: DraftChoicesResponse = {
  choices: [],
  idle: [],
  element_status: [],
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
