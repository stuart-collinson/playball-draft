import { LuckWizard } from "@pbd/components/Luck/LuckWizard"
import { PageTitle } from "@pbd/components/PageTitle/PageTitle"
import { UnlockCard } from "@pbd/components/UnlockCard/UnlockCard"
import { ADMIN_LUCK_HREF } from "@pbd/lib/constants/Pages"
import { isDatabaseConfigured } from "@pbd/server/db"
import { hasGateAccess, isAdminConfigured } from "@pbd/server/forfeits/gate"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import type { JSX } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Add Luck of the Week"

export const metadata: Metadata = { title: PAGE_TITLE }

const AddLuckPage = async (): Promise<JSX.Element> => {
  if (!isAdminConfigured() || !isDatabaseConfigured()) notFound()

  const requestHeaders = await headers()
  if (!hasGateAccess("upload", requestHeaders))
    return (
      <>
        <PageTitle title={PAGE_TITLE} backHref={ADMIN_LUCK_HREF} showLeagueFilter={false} />
        <UnlockCard audience="upload" />
      </>
    )

  return (
    <>
      <PageTitle title={PAGE_TITLE} backHref={ADMIN_LUCK_HREF} showLeagueFilter={false} />
      <LuckWizard />
    </>
  )
}

export default AddLuckPage
