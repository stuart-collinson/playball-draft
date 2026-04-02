import { notFound } from "next/navigation"
import type { Metadata } from "next"
import type { JSX } from "react"
import { Suspense } from "react"
import { PicksGrid } from "@pbd/components/PickCard/index"
import { PicksSkeleton } from "@pbd/components/PickCard/PicksSkeleton"
import { IS_VALID_LEAGUE_SLUG, LEAGUE_LABELS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl"
import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import { api, getQueryClient, HydrateClient } from "@pbd/trpc/server"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ league: string }>
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { league } = await params
  if (!IS_VALID_LEAGUE_SLUG(league)) return {}
  return { title: `Picks · ${LEAGUE_LABELS[league]}` }
}

const PicksPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { league } = await params
  if (!IS_VALID_LEAGUE_SLUG(league)) notFound()

  const leagueId = LEAGUE_SLUG_TO_ID[league as LeagueSlug]
  const qc = getQueryClient()

  void Promise.all([
    qc.prefetchQuery(api.fpl.draftChoices.queryOptions({ leagueId })),
    qc.prefetchQuery(api.fpl.bootstrapStatic.queryOptions()),
  ])

  return (
    <HydrateClient>
      <h1 className="mb-6 text-xl font-bold text-foreground">
        {LEAGUE_LABELS[league as LeagueSlug]} Draft Picks
      </h1>
      <Suspense fallback={<PicksSkeleton />}>
        <PicksGrid leagueId={leagueId} />
      </Suspense>
    </HydrateClient>
  )
}

export default PicksPage
