import { NavigationCardGroup } from "@pbd/components/NavigationCards/NavigationCardGroup"
import { PageTitle } from "@pbd/components/PageTitle/PageTitle"
import { buildImportantTiles, buildStatTileGroups } from "@pbd/lib/constants/Navigation"
import { hasAnyCup } from "@pbd/server/cups/repository"
import { isDatabaseConfigured } from "@pbd/server/db"
import { hasGateAccess, isForfeitsConfigured } from "@pbd/server/forfeits/gate"
import type { Metadata } from "next"
import { headers } from "next/headers"
import type { JSX } from "react"

export const dynamic = "force-dynamic"

const PAGE_TITLE = "Extra"

export const metadata: Metadata = { title: PAGE_TITLE }

const anyCupExists = async (): Promise<boolean> => {
  try {
    return await hasAnyCup()
  } catch (error) {
    console.error("[cups] could not check whether any cup exists", error)
    return false
  }
}

const ExtraPage = async (): Promise<JSX.Element> => {
  const requestHeaders = await headers()
  const databaseConfigured = isDatabaseConfigured()
  const showCups = databaseConfigured && (await anyCupExists())

  return (
    <>
      <PageTitle title={PAGE_TITLE} />
      <div className="flex flex-col gap-6">
        <NavigationCardGroup
          heading="Important"
          tiles={buildImportantTiles({
            showForfeits: isForfeitsConfigured(),
            showLuck: databaseConfigured,
            showAdmin: hasGateAccess("upload", requestHeaders),
            showCups,
          })}
        />
        {buildStatTileGroups({ databaseConfigured }).map((group) => (
          <NavigationCardGroup key={group.heading} heading={group.heading} tiles={group.tiles} />
        ))}
      </div>
    </>
  )
}

export default ExtraPage
