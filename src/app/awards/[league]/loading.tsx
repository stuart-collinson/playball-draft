import { AwardsSkeleton } from "@pbd/components/Awards/AwardsSkeleton"
import { PageTitle } from "@pbd/components/PageTitle"
import { EXTRA_BACK_HREF, PAGE_TITLES } from "@pbd/lib/constants/Pages"
import type { JSX } from "react"

const AwardsLoading = (): JSX.Element => (
  <>
    <PageTitle title={PAGE_TITLES.awards} backHref={EXTRA_BACK_HREF} />
    <AwardsSkeleton />
  </>
)

export default AwardsLoading
