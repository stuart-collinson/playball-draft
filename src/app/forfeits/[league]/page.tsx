import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { ForfeitsFilterBar } from "@pbd/components/Forfeits/ForfeitsFilterBar"
import { ForfeitsGrid } from "@pbd/components/Forfeits/ForfeitsGrid"
import { ForfeitsGridSkeleton } from "@pbd/components/Forfeits/ForfeitsGridSkeleton"
import { ForfeitsHeader } from "@pbd/components/Forfeits/ForfeitsHeader"
import { ForfeitsUnlockCard } from "@pbd/components/Forfeits/ForfeitsUnlockCard"
import { PageTitle } from "@pbd/components/PageTitle"
import { EXTRA_BACK_HREF } from "@pbd/lib/constants/Pages"
import { buildForfeitsListInput } from "@pbd/lib/forfeits"
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

const firstValue = (value: string | string[] | undefined): string | null => {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === "string" && raw.length > 0 ? raw : null
}

const ForfeitsPage = async ({ params, searchParams }: PageProps): Promise<JSX.Element> => {
  const { league } = await params
  if (!IS_VALID_LEAGUE_SCOPE(league) || !isForfeitsConfigured()) notFound()

  const requestHeaders = await headers()
  if (!hasGateAccess("view", requestHeaders))
    return (
      <>
        <PageTitle title={PAGE_TITLE} backHref={EXTRA_BACK_HREF} showLeagueFilter={false} />
        <ForfeitsUnlockCard
          audience="view"
          title="Members Only"
          message="Enter the league password to open the forfeit archive."
        />
      </>
    )

  const query = await searchParams
  const input = buildForfeitsListInput(league, {
    cadence: firstValue(query.cadence) === "annual" ? "annual" : "weekly",
    gameweek: firstValue(query.gw),
    type: firstValue(query.type),
    subType: firstValue(query.sub),
    person: firstValue(query.person),
  })

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(api.fpl.gameState.queryOptions())
  void queryClient.prefetchInfiniteQuery(
    api.forfeits.list.infiniteQueryOptions(input, {
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    }),
  )

  return (
    <HydrateClient>
      <ForfeitsHeader scope={league} backHref={EXTRA_BACK_HREF} />
      <div className="flex flex-col gap-4">
        <ForfeitsFilterBar scope={league} />
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
