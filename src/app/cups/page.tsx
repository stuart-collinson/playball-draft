import { CupHistoryDrawer } from "@pbd/components/Cup/CupHistoryDrawer"
import { CupSelector } from "@pbd/components/Cup/CupSelector"
import { CupSelectorSkeleton } from "@pbd/components/Cup/CupSelectorSkeleton"
import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { PageTitle } from "@pbd/components/PageTitle/PageTitle"
import { CUPS_ERROR_MESSAGE, CUPS_ERROR_TITLE } from "@pbd/lib/constants/Cups"
import { EXTRA_BACK_HREF, cupHref } from "@pbd/lib/constants/Pages"
import { isDatabaseConfigured } from "@pbd/server/db"
import { HydrateClient, api, getQueryClient } from "@pbd/trpc/server"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import type { JSX } from "react"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Cups"

export const metadata: Metadata = { title: PAGE_TITLE }

const CupsPage = async (): Promise<JSX.Element> => {
  if (!isDatabaseConfigured()) notFound()

  const queryClient = getQueryClient()
  const listOptions = api.cups.list.queryOptions()
  await queryClient.prefetchQuery(listOptions)

  const cups = queryClient.getQueryData(listOptions.queryKey) ?? []
  const running = cups.filter((cup) => cup.status === "running")
  const onlyCup = running.length === 1 ? running[0] : undefined
  if (onlyCup) redirect(cupHref(onlyCup.id))

  return (
    <HydrateClient>
      <PageTitle
        title={PAGE_TITLE}
        backHref={EXTRA_BACK_HREF}
        showLeagueFilter={false}
        action={
          <Suspense fallback={null}>
            <CupHistoryDrawer />
          </Suspense>
        }
      />
      <DataErrorBoundary title={CUPS_ERROR_TITLE} message={CUPS_ERROR_MESSAGE}>
        <Suspense fallback={<CupSelectorSkeleton />}>
          <CupSelector />
        </Suspense>
      </DataErrorBoundary>
    </HydrateClient>
  )
}

export default CupsPage
