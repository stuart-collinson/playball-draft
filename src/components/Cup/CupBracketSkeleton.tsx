import { CupBracketPanelsSkeleton } from "@pbd/components/Cup/CupBracketPanelsSkeleton"
import { CupBracketWideSkeleton } from "@pbd/components/Cup/CupBracketWideSkeleton"
import type { JSX } from "react"

export const CupBracketSkeleton = (): JSX.Element => (
  <>
    <CupBracketPanelsSkeleton />
    <CupBracketWideSkeleton />
  </>
)
