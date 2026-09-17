import { CupBracketSkeleton } from "@pbd/components/Cup/CupBracketSkeleton"
import { CupHistoryDrawer } from "@pbd/components/Cup/CupHistoryDrawer"
import { CupScreen } from "@pbd/components/Cup/CupScreen"
import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { PageTitle } from "@pbd/components/PageTitle/PageTitle"
import { CUPS_ERROR_MESSAGE, CUPS_ERROR_TITLE } from "@pbd/lib/constants/Cups"
import { CUPS_HREF, EXTRA_BACK_HREF } from "@pbd/lib/constants/Pages"
import { isDatabaseConfigured } from "@pbd/server/db"
import { HydrateClient, api, getQueryClient } from "@pbd/trpc/server"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { JSX } from "react"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Cups"

const ONE_RUNNING_CUP = 1

export const metadata: Metadata = { title: PAGE_TITLE }

type PageProps = {
  params: Promise<{ cupId: string }>
}

const CupPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  if (!isDatabaseConfigured()) notFound()

  const { cupId } = await params
  const queryClient = getQueryClient()
  const listOptions = api.cups.list.queryOptions()

  await queryClient.prefetchQuery(listOptions)
  void queryClient.prefetchQuery(api.cups.detail.queryOptions({ cupId }))

  const cups = queryClient.getQueryData(listOptions.queryKey) ?? []
  const runningCount = cups.filter((cup) => cup.status === "running").length

  return (
    <HydrateClient>
      <PageTitle
        title={PAGE_TITLE}
        backHref={runningCount > ONE_RUNNING_CUP ? CUPS_HREF : EXTRA_BACK_HREF}
        showLeagueFilter={false}
        action={
          <Suspense fallback={null}>
            <CupHistoryDrawer />
          </Suspense>
        }
      />
      <DataErrorBoundary title={CUPS_ERROR_TITLE} message={CUPS_ERROR_MESSAGE}>
        <Suspense fallback={<CupBracketSkeleton />}>
          <CupScreen cupId={cupId} />
        </Suspense>
      </DataErrorBoundary>
    </HydrateClient>
  )
}

export default CupPage
