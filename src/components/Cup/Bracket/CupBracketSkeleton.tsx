import { CupBracketPanelsSkeleton } from "@pbd/components/Cup/Bracket/CupBracketPanelsSkeleton"
import { CupBracketWideSkeleton } from "@pbd/components/Cup/Bracket/CupBracketWideSkeleton"
import type { JSX } from "react"

export const CupBracketSkeleton = (): JSX.Element => (
  <>
    <CupBracketPanelsSkeleton />
    <CupBracketWideSkeleton />
  </>
)
