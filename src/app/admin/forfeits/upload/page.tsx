import { ForfeitUploadWizard } from "@pbd/components/Forfeits/ForfeitUploadWizard"
import { UnlockCard } from "@pbd/components/UnlockCard/UnlockCard"
import { PageTitle } from "@pbd/components/PageTitle/PageTitle"
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
        <UnlockCard audience="upload" />
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
