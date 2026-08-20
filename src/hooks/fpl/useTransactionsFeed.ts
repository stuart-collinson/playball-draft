import {
  bootstrapStaticOptions,
  leagueDetailsOptions,
  leagueTradesOptions,
  transactionsOptions,
} from "@pbd/hooks/fpl/fpl.cache"
import { buildTransactionFeed } from "@pbd/lib/fpl/transactionFeed"
import type { TransactionFeed } from "@pbd/lib/fpl/transactionFeed"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const useTransactionsFeed = (leagueId: number): TransactionFeed => {
  const trpc = useTRPC()

  const { data: transactions } = useSuspenseQuery(transactionsOptions(trpc, leagueId))
  const { data: trades } = useSuspenseQuery(leagueTradesOptions(trpc, leagueId))
  const { data: bootstrap } = useSuspenseQuery(bootstrapStaticOptions(trpc))
  const { data: details } = useSuspenseQuery(leagueDetailsOptions(trpc, leagueId))

  return useMemo(
    () =>
      buildTransactionFeed({
        transactions: transactions.transactions,
        trades: trades.trades,
        elements: bootstrap.elements,
        teams: bootstrap.teams,
        leagueEntries: details.league_entries,
      }),
    [transactions, trades, bootstrap, details],
  )
}
