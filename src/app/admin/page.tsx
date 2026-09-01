import { ForfeitsUnlockCard } from "@pbd/components/Forfeits/ForfeitsUnlockCard"
import { NavigationCardGroup } from "@pbd/components/NavigationCards/NavigationCardGroup"
import { PageTitle } from "@pbd/components/PageTitle"
import { buildAdminTiles } from "@pbd/lib/constants/Navigation"
import { EXTRA_BACK_HREF } from "@pbd/lib/constants/Pages"
import { isDatabaseConfigured } from "@pbd/server/db"
import { hasGateAccess, isAdminConfigured } from "@pbd/server/forfeits/gate"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import type { JSX } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Admin"

export const metadata: Metadata = { title: PAGE_TITLE }

const AdminPage = async (): Promise<JSX.Element> => {
  if (!isAdminConfigured()) notFound()

  const requestHeaders = await headers()
  const isAdmin = hasGateAccess("upload", requestHeaders)

  return (
    <>
      <PageTitle title={PAGE_TITLE} backHref={EXTRA_BACK_HREF} showLeagueFilter={false} />
      {isAdmin ? (
        <NavigationCardGroup
          heading="Manage"
          tiles={buildAdminTiles({ showLuck: isDatabaseConfigured() })}
        />
      ) : (
        <ForfeitsUnlockCard
          audience="upload"
          title="Admins Only"
          message="Enter the admin password. Not everyone in the chat will have access to this."
        />
      )}
    </>
  )
}

export default AdminPage
