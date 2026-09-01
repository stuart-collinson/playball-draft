import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { ForfeitsUnlockCard } from "@pbd/components/Forfeits/ForfeitsUnlockCard"
import { LuckAdminList } from "@pbd/components/Luck/LuckAdminList"
import { LuckAdminListSkeleton } from "@pbd/components/Luck/LuckAdminListSkeleton"
import { PageTitle } from "@pbd/components/PageTitle"
import { Button } from "@pbd/components/ui/Button"
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

const ADMIN_BACK_HREF = "/admin"

const ADD_HREF = "/admin/luck-of-the-week/add"

export const metadata: Metadata = { title: PAGE_TITLE }

const ManageLuckPage = async (): Promise<JSX.Element> => {
  if (!isAdminConfigured() || !isDatabaseConfigured()) notFound()

  const requestHeaders = await headers()
  if (!hasGateAccess("upload", requestHeaders))
    return (
      <>
        <PageTitle title={PAGE_TITLE} backHref={ADMIN_BACK_HREF} showLeagueFilter={false} />
        <ForfeitsUnlockCard
          audience="upload"
          title="Admins Only"
          message="Enter the admin password. Not everyone in the chat will have access to this."
        />
      </>
    )

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(api.fpl.gameState.queryOptions())
  void queryClient.prefetchQuery(api.luck.list.queryOptions())

  return (
    <HydrateClient>
      <PageTitle title={PAGE_TITLE} backHref={ADMIN_BACK_HREF} showLeagueFilter={false} />
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Button size="sm" variant="secondary" asChild>
            <Link href={ADD_HREF}>
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
