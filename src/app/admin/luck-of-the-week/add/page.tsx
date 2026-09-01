import { ForfeitsUnlockCard } from "@pbd/components/Forfeits/ForfeitsUnlockCard"
import { LuckWizard } from "@pbd/components/Luck/LuckWizard"
import { PageTitle } from "@pbd/components/PageTitle"
import { isDatabaseConfigured } from "@pbd/server/db"
import { hasGateAccess, isAdminConfigured } from "@pbd/server/forfeits/gate"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import type { JSX } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Add Luck of the Week"

const MANAGE_BACK_HREF = "/admin/luck-of-the-week"

export const metadata: Metadata = { title: PAGE_TITLE }

const AddLuckPage = async (): Promise<JSX.Element> => {
  if (!isAdminConfigured() || !isDatabaseConfigured()) notFound()

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
      <LuckWizard />
    </>
  )
}

export default AddLuckPage
