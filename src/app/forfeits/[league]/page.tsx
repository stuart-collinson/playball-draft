import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { ForfeitsGridSkeleton } from "@pbd/components/Forfeits/ForfeitsGridSkeleton"
import { ForfeitsUnlockCard } from "@pbd/components/Forfeits/ForfeitsUnlockCard"
import { ForfeitsView } from "@pbd/components/Forfeits/ForfeitsView"
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

const firstValue = (value: string | string[] | undefined): string | null =>
  typeof value === "string" && value.length > 0 ? value : null

const ForfeitsPage = async ({ params, searchParams }: PageProps): Promise<JSX.Element> => {
  const { league } = await params
  if (!IS_VALID_LEAGUE_SCOPE(league) || !isForfeitsConfigured()) notFound()

  const requestHeaders = await headers()
  if (!hasGateAccess("view", requestHeaders))
    return (
      <>
        <PageTitle title={PAGE_TITLE} backHref={EXTRA_BACK_HREF} />
        <ForfeitsUnlockCard
          audience="view"
          title="Members Only"
          message="Type the league password to open the forfeit archive."
        />
      </>
    )

  const query = await searchParams
  const input = buildForfeitsListInput(league, {
    gameweek: firstValue(query.gw),
    type: firstValue(query.type),
    subType: firstValue(query.sub),
    person: firstValue(query.person),
  })

  const canUpload = hasGateAccess("upload", requestHeaders)
  const queryClient = getQueryClient()
  void queryClient.prefetchInfiniteQuery(
    api.forfeits.list.infiniteQueryOptions(input, {
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    }),
  )

  return (
    <HydrateClient>
      <PageTitle title={PAGE_TITLE} backHref={EXTRA_BACK_HREF} />
      <DataErrorBoundary
        title="Forfeits Unavailable"
        message="The forfeit archive didn't load. Give it another go."
      >
        <Suspense fallback={<ForfeitsGridSkeleton />}>
          <ForfeitsView scope={league} canUpload={canUpload} />
        </Suspense>
      </DataErrorBoundary>
    </HydrateClient>
  )
}

export default ForfeitsPage
