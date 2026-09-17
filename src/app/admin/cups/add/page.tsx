import { CupWizard } from "@pbd/components/Cup/CupWizard"
import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { PageTitle } from "@pbd/components/PageTitle/PageTitle"
import { UnlockCard } from "@pbd/components/UnlockCard/UnlockCard"
import { CUPS_ERROR_TITLE } from "@pbd/lib/constants/Cups"
import { ADMIN_CUPS_HREF } from "@pbd/lib/constants/Pages"
import { isDatabaseConfigured } from "@pbd/server/db"
import { hasGateAccess, isAdminConfigured } from "@pbd/server/forfeits/gate"
import { HydrateClient, api, getQueryClient } from "@pbd/trpc/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import type { JSX } from "react"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Create"

export const metadata: Metadata = { title: PAGE_TITLE }

const AddCupPage = async (): Promise<JSX.Element> => {
  if (!isAdminConfigured() || !isDatabaseConfigured()) notFound()

  const requestHeaders = await headers()
  if (!hasGateAccess("upload", requestHeaders))
    return (
      <>
        <PageTitle title={PAGE_TITLE} backHref={ADMIN_CUPS_HREF} showLeagueFilter={false} />
        <UnlockCard audience="upload" />
      </>
    )

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(api.cups.scheduleWindow.queryOptions())

  return (
    <HydrateClient>
      <PageTitle title={PAGE_TITLE} backHref={ADMIN_CUPS_HREF} showLeagueFilter={false} />
      <DataErrorBoundary
        title={CUPS_ERROR_TITLE}
        message="We couldn't work out which game weeks are still open."
      >
        <Suspense fallback={null}>
          <CupWizard />
        </Suspense>
      </DataErrorBoundary>
    </HydrateClient>
  )
}

export default AddCupPage
