import { PageTitle } from "@pbd/components/PageTitle"
import { SpinTheWheel } from "@pbd/components/SpinTheWheel/index"
import type { Metadata } from "next"
import type { JSX } from "react"

const PAGE_TITLE = "Spin the Wheel"

export const metadata: Metadata = { title: PAGE_TITLE }

const SpinTheWheelPage = (): JSX.Element => (
  <>
    <PageTitle title={PAGE_TITLE} backHref="/extra" />
    <SpinTheWheel />
  </>
)

export default SpinTheWheelPage
