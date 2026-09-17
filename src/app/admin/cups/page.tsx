import { AdminListSkeleton } from "@pbd/components/Admin/AdminListSkeleton"
import { CupAdminList } from "@pbd/components/Cup/CupAdminList"
import { CupCreateButton } from "@pbd/components/Cup/CupCreateButton"
import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { PageTitle } from "@pbd/components/PageTitle/PageTitle"
import { UnlockCard } from "@pbd/components/UnlockCard/UnlockCard"
import { CUPS_ERROR_MESSAGE, CUPS_ERROR_TITLE } from "@pbd/lib/constants/Cups"
import { ADMIN_HREF } from "@pbd/lib/constants/Pages"
import { isDatabaseConfigured } from "@pbd/server/db"
import { hasGateAccess, isAdminConfigured } from "@pbd/server/forfeits/gate"
import { HydrateClient, api, getQueryClient } from "@pbd/trpc/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import type { JSX } from "react"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Cups"

const SKELETON_ROWS = 3

export const metadata: Metadata = { title: PAGE_TITLE }

const ManageCupsPage = async (): Promise<JSX.Element> => {
  if (!isAdminConfigured() || !isDatabaseConfigured()) notFound()

  const requestHeaders = await headers()
  if (!hasGateAccess("upload", requestHeaders))
    return (
      <>
        <PageTitle title={PAGE_TITLE} backHref={ADMIN_HREF} showLeagueFilter={false} />
        <UnlockCard audience="upload" />
      </>
    )

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(api.cups.list.queryOptions())
  void queryClient.prefetchQuery(api.cups.scheduleWindow.queryOptions())

  return (
    <HydrateClient>
      <PageTitle
        title={PAGE_TITLE}
        backHref={ADMIN_HREF}
        showLeagueFilter={false}
        action={
          <Suspense fallback={null}>
            <CupCreateButton />
          </Suspense>
        }
      />
      <DataErrorBoundary title={CUPS_ERROR_TITLE} message={CUPS_ERROR_MESSAGE}>
        <Suspense fallback={<AdminListSkeleton rowCount={SKELETON_ROWS} />}>
          <CupAdminList />
        </Suspense>
      </DataErrorBoundary>
    </HydrateClient>
  )
}

export default ManageCupsPage
