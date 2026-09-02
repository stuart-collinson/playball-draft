import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { ForfeitAdminList } from "@pbd/components/Forfeits/ForfeitAdminList"
import { ForfeitAdminListSkeleton } from "@pbd/components/Forfeits/ForfeitAdminListSkeleton"
import { ForfeitCadenceFilter } from "@pbd/components/Forfeits/ForfeitCadenceFilter"
import { ForfeitsFilterBar } from "@pbd/components/Forfeits/ForfeitsFilterBar"
import { ForfeitsUnlockCard } from "@pbd/components/Forfeits/ForfeitsUnlockCard"
import { PageTitle } from "@pbd/components/PageTitle"
import { Button } from "@pbd/components/ui/Button"
import { buildForfeitsListInput } from "@pbd/lib/forfeits"
import { COMBINED_SCOPE } from "@pbd/lib/leagues"
import { hasGateAccess, isForfeitsConfigured } from "@pbd/server/forfeits/gate"
import { HydrateClient, api, getQueryClient } from "@pbd/trpc/server"
import { Upload } from "lucide-react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { JSX } from "react"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Manage Forfeits"

const ADMIN_BACK_HREF = "/admin"

const UPLOAD_HREF = "/admin/forfeits/upload"

export const metadata: Metadata = { title: PAGE_TITLE }

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const firstValue = (value: string | string[] | undefined): string | null => {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === "string" && raw.length > 0 ? raw : null
}

const ManageForfeitsPage = async ({ searchParams }: PageProps): Promise<JSX.Element> => {
  if (!isForfeitsConfigured()) notFound()

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

  const query = await searchParams
  const input = buildForfeitsListInput(COMBINED_SCOPE, {
    cadence: firstValue(query.cadence) === "annual" ? "annual" : "weekly",
    gameweek: firstValue(query.gw),
    type: firstValue(query.type),
    subType: firstValue(query.sub),
    person: firstValue(query.person),
  })

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(api.fpl.gameState.queryOptions())
  void queryClient.prefetchInfiniteQuery(
    api.forfeits.list.infiniteQueryOptions(input, {
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    }),
  )

  return (
    <HydrateClient>
      <PageTitle title={PAGE_TITLE} backHref={ADMIN_BACK_HREF} showLeagueFilter={false} />
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ForfeitCadenceFilter />
          <Button size="sm" variant="secondary" asChild>
            <Link href={UPLOAD_HREF}>
              <Upload size={14} />
              Upload
            </Link>
          </Button>
        </div>
        <ForfeitsFilterBar scope={COMBINED_SCOPE} />
        <DataErrorBoundary
          title="Forfeits Unavailable"
          message="The forfeit archive didn't load. Give it another go."
        >
          <Suspense fallback={<ForfeitAdminListSkeleton />}>
            <ForfeitAdminList />
          </Suspense>
        </DataErrorBoundary>
      </div>
    </HydrateClient>
  )
}

export default ManageForfeitsPage
