import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { ForfeitsFilterBar } from "@pbd/components/Forfeits/ForfeitsFilterBar"
import { ForfeitsGrid } from "@pbd/components/Forfeits/ForfeitsGrid"
import { ForfeitsGridSkeleton } from "@pbd/components/Forfeits/ForfeitsGridSkeleton"
import { PageTitle } from "@pbd/components/PageTitle/PageTitle"
import { UnlockCard } from "@pbd/components/UnlockCard/UnlockCard"
import { EXTRA_BACK_HREF } from "@pbd/lib/constants/Pages"
import { buildForfeitsListInput, readForfeitFilters } from "@pbd/lib/forfeits/filters"
import { IS_VALID_LEAGUE_SCOPE, getLeagueLabel } from "@pbd/lib/leagues"
import { hasGateAccess, isForfeitsConfigured } from "@pbd/server/forfeits/gate"
import { HydrateClient, api, getQueryClient } from "@pbd/trpc/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import type { JSX } from "react"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Forfeits"

type PageProps = {
  params: Promise<{ league: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { league } = await params
  if (!IS_VALID_LEAGUE_SCOPE(league)) return {}
  return { title: `${PAGE_TITLE} · ${getLeagueLabel(league)}` }
}

const ForfeitsPage = async ({ params, searchParams }: PageProps): Promise<JSX.Element> => {
  const { league } = await params
  if (!IS_VALID_LEAGUE_SCOPE(league) || !isForfeitsConfigured()) notFound()

  const requestHeaders = await headers()
  if (!hasGateAccess("view", requestHeaders))
    return (
      <>
        <PageTitle title={PAGE_TITLE} backHref={EXTRA_BACK_HREF} showLeagueFilter={false} />
        <UnlockCard audience="view" />
      </>
    )

  const query = await searchParams
  const input = buildForfeitsListInput(league, readForfeitFilters(query))

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(api.fpl.gameState.queryOptions())
  void queryClient.prefetchInfiniteQuery(
    api.forfeits.list.infiniteQueryOptions(input, {
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    }),
  )

  return (
    <HydrateClient>
      <PageTitle title={PAGE_TITLE} backHref={EXTRA_BACK_HREF} showLeagueFilter={false} />
      <div className="flex flex-col gap-4">
        <ForfeitsFilterBar scope={league} leagueSelectable />
        <DataErrorBoundary
          title="Forfeits Unavailable"
          message="The forfeit archive didn't load. Give it another go."
        >
          <Suspense fallback={<ForfeitsGridSkeleton />}>
            <ForfeitsGrid scope={league} />
          </Suspense>
        </DataErrorBoundary>
      </div>
    </HydrateClient>
  )
}

export default ForfeitsPage
