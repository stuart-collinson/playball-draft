import { NavigationCardGroup } from "@pbd/components/NavigationCards/NavigationCardGroup"
import { PageTitle } from "@pbd/components/PageTitle"
import { buildPageTiles, buildStatTiles } from "@pbd/lib/constants/Navigation"
import type { Metadata } from "next"
import type { JSX } from "react"

const PAGE_TITLE = "Extra"

export const metadata: Metadata = { title: PAGE_TITLE }

const ExtraPage = (): JSX.Element => (
  <div className="flex flex-col gap-6">
    <PageTitle title={PAGE_TITLE} />
    <NavigationCardGroup heading="Pages" tiles={buildPageTiles()} />
    <NavigationCardGroup heading="Stats" tiles={buildStatTiles()} />
  </div>
)

export default ExtraPage
