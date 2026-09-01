import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { LuckTimeline } from "@pbd/components/Luck/LuckTimeline"
import { LuckTimelineSkeleton } from "@pbd/components/Luck/LuckTimelineSkeleton"
import { PageTitle } from "@pbd/components/PageTitle"
import { EXTRA_BACK_HREF } from "@pbd/lib/constants/Pages"
import { isDatabaseConfigured } from "@pbd/server/db"
import { HydrateClient, api, getQueryClient } from "@pbd/trpc/server"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { JSX } from "react"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Luck of the Week"

export const metadata: Metadata = { title: PAGE_TITLE }

const LuckOfTheWeekPage = (): JSX.Element => {
  if (!isDatabaseConfigured()) notFound()

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(api.luck.list.queryOptions())

  return (
    <HydrateClient>
      <PageTitle title={PAGE_TITLE} backHref={EXTRA_BACK_HREF} showLeagueFilter={false} />
      <DataErrorBoundary
        title="Luck Unavailable"
        message="The lucky moments didn't load. Give it another go."
      >
        <Suspense fallback={<LuckTimelineSkeleton />}>
          <LuckTimeline />
        </Suspense>
      </DataErrorBoundary>
    </HydrateClient>
  )
}

export default LuckOfTheWeekPage
