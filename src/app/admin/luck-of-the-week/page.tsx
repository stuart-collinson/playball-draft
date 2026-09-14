import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { LuckAdminList } from "@pbd/components/Luck/LuckAdminList"
import { LuckAdminListSkeleton } from "@pbd/components/Luck/LuckAdminListSkeleton"
import { PageTitle } from "@pbd/components/PageTitle/PageTitle"
import { UnlockCard } from "@pbd/components/UnlockCard/UnlockCard"
import { Button } from "@pbd/components/ui/button"
import { ADD_LUCK_HREF, ADMIN_HREF } from "@pbd/lib/constants/Pages"
import { isDatabaseConfigured } from "@pbd/server/db"
import { hasGateAccess, isAdminConfigured } from "@pbd/server/forfeits/gate"
import { HydrateClient, api, getQueryClient } from "@pbd/trpc/server"
import { Plus } from "lucide-react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { JSX } from "react"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Manage Luck of the Week"

export const metadata: Metadata = { title: PAGE_TITLE }

const ManageLuckPage = async (): Promise<JSX.Element> => {
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
  void queryClient.prefetchQuery(api.luck.list.queryOptions())

  return (
    <HydrateClient>
      <PageTitle title={PAGE_TITLE} backHref={ADMIN_HREF} showLeagueFilter={false} />
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Button size="sm" variant="secondary" asChild>
            <Link href={ADD_LUCK_HREF}>
              <Plus size={14} />
              Add lucky moment
            </Link>
          </Button>
        </div>
        <DataErrorBoundary
          title="Luck Unavailable"
          message="The lucky moments didn't load. Give it another go."
        >
          <Suspense fallback={<LuckAdminListSkeleton />}>
            <LuckAdminList />
          </Suspense>
        </DataErrorBoundary>
      </div>
    </HydrateClient>
  )
}

export default ManageLuckPage
