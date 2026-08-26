import { PageTitle } from "@pbd/components/PageTitle"
import { PicksGridSkeleton } from "@pbd/components/Picks/PicksGridSkeleton"
import { EXTRA_BACK_HREF, PAGE_TITLES } from "@pbd/lib/constants/Pages"
import type { JSX } from "react"

const PicksLoading = (): JSX.Element => (
  <>
    <PageTitle title={PAGE_TITLES.picks} backHref={EXTRA_BACK_HREF} />
    <PicksGridSkeleton />
  </>
)

export default PicksLoading
