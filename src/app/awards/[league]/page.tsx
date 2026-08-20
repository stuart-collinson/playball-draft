import { AwardsSkeleton } from "@pbd/components/Awards/AwardsSkeleton"
import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { AwardsView } from "@pbd/components/Awards/AwardsView"
import { PageTitle } from "@pbd/components/PageTitle"
import { IS_VALID_LEAGUE_SCOPE, getLeagueIds, getLeagueLabel } from "@pbd/lib/leagues"
import { HydrateClient, api, getQueryClient } from "@pbd/trpc/server"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { JSX } from "react"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Awards"

type PageProps = {
  params: Promise<{ league: string }>
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { league } = await params
  if (!IS_VALID_LEAGUE_SCOPE(league)) return {}
  return { title: `${PAGE_TITLE} · ${getLeagueLabel(league)}` }
}

const AwardsPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { league } = await params
  if (!IS_VALID_LEAGUE_SCOPE(league)) notFound()

  const leagueIds = getLeagueIds(league)
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(api.fpl.gameState.queryOptions())

  void Promise.all([queryClient.prefetchQuery(api.fpl.awards.queryOptions({ leagueIds }))])

  return (
    <HydrateClient>
      <PageTitle title={PAGE_TITLE} backHref="/extra" />
      <DataErrorBoundary
        title="No Awards Yet"
        message="Fantasy Premier League didn't return enough data to hand out awards."
      >
        <Suspense fallback={<AwardsSkeleton />}>
          <AwardsView leagueIds={leagueIds} />
        </Suspense>
      </DataErrorBoundary>
    </HydrateClient>
  )
}

export default AwardsPage
