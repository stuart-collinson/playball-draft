import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { ForfeitDetail } from "@pbd/components/Forfeits/ForfeitDetail"
import { ForfeitDetailSkeleton } from "@pbd/components/Forfeits/ForfeitDetailSkeleton"
import { ForfeitsUnlockCard } from "@pbd/components/Forfeits/ForfeitsUnlockCard"
import { PageTitle } from "@pbd/components/PageTitle"
import { IS_VALID_LEAGUE_SCOPE } from "@pbd/lib/leagues"
import { hasGateAccess, isForfeitsConfigured } from "@pbd/server/forfeits/gate"
import { HydrateClient, api, getQueryClient } from "@pbd/trpc/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import type { JSX } from "react"
import { Suspense } from "react"
import { z } from "zod"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Forfeit"

export const metadata: Metadata = { title: PAGE_TITLE }

type PageProps = {
  params: Promise<{ league: string; id: string }>
}

const ForfeitDetailPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { league, id } = await params
  if (!IS_VALID_LEAGUE_SCOPE(league) || !isForfeitsConfigured()) notFound()

  const parsedId = z.string().uuid().safeParse(id)
  if (!parsedId.success) notFound()

  const requestHeaders = await headers()
  if (!hasGateAccess("view", requestHeaders))
    return (
      <>
        <PageTitle title={PAGE_TITLE} backHref={`/forfeits/${league}`} showLeagueFilter={false} />
        <ForfeitsUnlockCard
          audience="view"
          title="Members Only"
          message="Enter the league password to open the forfeit archive."
        />
      </>
    )

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(api.forfeits.detail.queryOptions({ id: parsedId.data }))

  return (
    <HydrateClient>
      <PageTitle title={PAGE_TITLE} backHref={`/forfeits/${league}`} />
      <DataErrorBoundary
        title="Forfeit Unavailable"
        message="This forfeit didn't load. It may have been removed."
      >
        <Suspense fallback={<ForfeitDetailSkeleton />}>
          <ForfeitDetail id={parsedId.data} />
        </Suspense>
      </DataErrorBoundary>
    </HydrateClient>
  )
}

export default ForfeitDetailPage
