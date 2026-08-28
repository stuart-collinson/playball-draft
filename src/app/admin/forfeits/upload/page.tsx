import { ForfeitUploadWizard } from "@pbd/components/Forfeits/ForfeitUploadWizard"
import { ForfeitsUnlockCard } from "@pbd/components/Forfeits/ForfeitsUnlockCard"
import { PageTitle } from "@pbd/components/PageTitle"
import { hasGateAccess, isForfeitsConfigured } from "@pbd/server/forfeits/gate"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import type { JSX } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Upload Forfeit"

const MANAGE_BACK_HREF = "/admin/forfeits"

export const metadata: Metadata = { title: PAGE_TITLE }

const UploadForfeitPage = async (): Promise<JSX.Element> => {
  if (!isForfeitsConfigured()) notFound()

  const requestHeaders = await headers()
  if (!hasGateAccess("upload", requestHeaders))
    return (
      <>
        <PageTitle title={PAGE_TITLE} backHref={MANAGE_BACK_HREF} showLeagueFilter={false} />
        <ForfeitsUnlockCard
          audience="upload"
          title="Admins Only"
          message="Enter the admin password. Not everyone in the chat will have access to this."
        />
      </>
    )

  return (
    <>
      <PageTitle title={PAGE_TITLE} backHref={MANAGE_BACK_HREF} showLeagueFilter={false} />
      <ForfeitUploadWizard />
    </>
  )
}

export default UploadForfeitPage
