import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { PageTitle } from "@pbd/components/PageTitle"
import { TransactionsSkeleton } from "@pbd/components/Transactions/TransactionsSkeleton"
import { TransactionsView } from "@pbd/components/Transactions/TransactionsView"
import { IS_VALID_LEAGUE_SLUG, LEAGUE_LABELS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl"
import { COMBINED_SCOPE, DEFAULT_LEAGUE_SLUG } from "@pbd/lib/leagues"
import { HydrateClient, api, getQueryClient } from "@pbd/trpc/server"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import type { JSX } from "react"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Transactions"

type PageProps = {
  params: Promise<{ league: string }>
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { league } = await params
  if (!IS_VALID_LEAGUE_SLUG(league)) return {}
  return { title: `${PAGE_TITLE} · ${LEAGUE_LABELS[league]}` }
}

const TransactionsPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { league } = await params
  if (league === COMBINED_SCOPE) redirect(`/transactions/${DEFAULT_LEAGUE_SLUG}`)
  if (!IS_VALID_LEAGUE_SLUG(league)) notFound()

  const leagueId = LEAGUE_SLUG_TO_ID[league]
  const queryClient = getQueryClient()

  void Promise.all([
    queryClient.prefetchQuery(api.fpl.transactions.queryOptions({ leagueId })),
    queryClient.prefetchQuery(api.fpl.leagueTrades.queryOptions({ leagueId })),
    queryClient.prefetchQuery(api.fpl.leagueDetails.queryOptions({ leagueId })),
    queryClient.prefetchQuery(api.fpl.bootstrapStatic.queryOptions()),
  ])

  return (
    <HydrateClient>
      <PageTitle title={PAGE_TITLE} />
      <DataErrorBoundary
        title="No Transactions"
        message="Fantasy Premier League didn't return this league's waivers or trades."
      >
        <Suspense fallback={<TransactionsSkeleton />}>
          <TransactionsView leagueId={leagueId} />
        </Suspense>
      </DataErrorBoundary>
    </HydrateClient>
  )
}

export default TransactionsPage
