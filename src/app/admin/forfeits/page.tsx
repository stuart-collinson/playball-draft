import { AdminListSkeleton } from "@pbd/components/Admin/AdminListSkeleton"
import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { ForfeitAdminList } from "@pbd/components/Forfeits/ForfeitAdminList"
import { ForfeitsFilterBar } from "@pbd/components/Forfeits/ForfeitsFilterBar"
import { PageTitle } from "@pbd/components/PageTitle/PageTitle"
import { UnlockCard } from "@pbd/components/UnlockCard/UnlockCard"
import { Button } from "@pbd/components/ui/button"
import { ADMIN_HREF, UPLOAD_FORFEIT_HREF } from "@pbd/lib/constants/Pages"
import { buildForfeitsListInput, readForfeitFilters } from "@pbd/lib/forfeits/filters"
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

const SKELETON_ROWS = 8

export const metadata: Metadata = { title: PAGE_TITLE }

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const ManageForfeitsPage = async ({ searchParams }: PageProps): Promise<JSX.Element> => {
  if (!isForfeitsConfigured()) notFound()

  const requestHeaders = await headers()
  if (!hasGateAccess("upload", requestHeaders))
    return (
      <>
        <PageTitle title={PAGE_TITLE} backHref={ADMIN_HREF} showLeagueFilter={false} />
        <UnlockCard audience="upload" />
      </>
    )

  const query = await searchParams
  const input = buildForfeitsListInput(COMBINED_SCOPE, readForfeitFilters(query))

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(api.fpl.gameState.queryOptions())
  void queryClient.prefetchInfiniteQuery(
    api.forfeits.list.infiniteQueryOptions(input, {
      getNextPageParam: (page) => page.nextCursor ?? undefined,
    }),
  )

  return (
    <HydrateClient>
      <PageTitle title={PAGE_TITLE} backHref={ADMIN_HREF} showLeagueFilter={false} />
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Button size="sm" variant="secondary" asChild>
            <Link href={UPLOAD_FORFEIT_HREF}>
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
          <Suspense fallback={<AdminListSkeleton rowCount={SKELETON_ROWS} />}>
            <ForfeitAdminList />
          </Suspense>
        </DataErrorBoundary>
      </div>
    </HydrateClient>
  )
}

export default ManageForfeitsPage
