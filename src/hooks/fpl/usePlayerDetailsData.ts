import {
  bootstrapStaticOptions,
  draftChoicesOptions,
  entryHistoryOptions,
  leagueTradesOptions,
  transactionsOptions,
} from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import { useQuery } from "@tanstack/react-query"

// Everything the PlayerDetails modal reads, fired in parallel and non-suspense
// so the modal renders its own placeholder states instead of suspending the
// page behind it.
export const usePlayerDetailsData = (leagueId: number, entryId: number) => {
  const trpc = useTRPC()

  const history = useQuery({
    ...entryHistoryOptions(trpc, entryId),
    enabled: entryId > 0,
  })
  const transactions = useQuery(transactionsOptions(trpc, leagueId))
  const trades = useQuery(leagueTradesOptions(trpc, leagueId))
  const choices = useQuery(draftChoicesOptions(trpc, leagueId))
  const bootstrap = useQuery(bootstrapStaticOptions(trpc))

  return { history, transactions, trades, choices, bootstrap }
}
