import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { PageTitle } from "@pbd/components/PageTitle"
import type { Metadata } from "next"
import type { JSX } from "react"

const PAGE_TITLE = "Spin the Wheel"

export const metadata: Metadata = { title: PAGE_TITLE }

const SpinTheWheelPage = (): JSX.Element => (
  <>
    <PageTitle title={PAGE_TITLE} backHref="/extra" />
    <EmptyState title={PAGE_TITLE} message="Spin the Wheel coming soon." />
  </>
)

export default SpinTheWheelPage
