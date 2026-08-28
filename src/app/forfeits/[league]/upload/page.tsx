import { ForfeitUploadWizard } from "@pbd/components/Forfeits/ForfeitUploadWizard"
import { ForfeitsUnlockCard } from "@pbd/components/Forfeits/ForfeitsUnlockCard"
import { PageTitle } from "@pbd/components/PageTitle"
import { IS_VALID_LEAGUE_SCOPE } from "@pbd/lib/leagues"
import { hasGateAccess, isForfeitsConfigured } from "@pbd/server/forfeits/gate"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import type { JSX } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Upload Forfeit"

export const metadata: Metadata = { title: PAGE_TITLE }

type PageProps = {
  params: Promise<{ league: string }>
}

const UploadForfeitPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { league } = await params
  if (!IS_VALID_LEAGUE_SCOPE(league) || !isForfeitsConfigured()) notFound()

  const requestHeaders = await headers()
  if (!hasGateAccess("upload", requestHeaders))
    return (
      <>
        <PageTitle title={PAGE_TITLE} backHref={`/forfeits/${league}`} showLeagueFilter={false} />
        <ForfeitsUnlockCard
          audience="upload"
          title="Uploaders Only"
          message="Enter the upload password — only two people have this one."
        />
      </>
    )

  return (
    <>
      <PageTitle title={PAGE_TITLE} backHref={`/forfeits/${league}`} showLeagueFilter={false} />
      <ForfeitUploadWizard scope={league} />
    </>
  )
}

export default UploadForfeitPage
