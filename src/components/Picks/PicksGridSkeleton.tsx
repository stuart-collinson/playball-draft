import { PicksCardSkeleton } from "@pbd/components/Cards/PicksCardSkeleton"
import { Select, SelectTrigger, SelectValue } from "@pbd/components/ui/select"
import { PICKS_DISPLAY_COUNT } from "@pbd/lib/constants/fpl"
import { skeletonKeys } from "@pbd/lib/skeletonKeys"
import type { JSX } from "react"

export const PicksGridSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-2">
      <Select disabled defaultValue="all">
        <SelectTrigger className="w-40" aria-label="Player">
          <SelectValue>All players</SelectValue>
        </SelectTrigger>
      </Select>
    </div>

    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {skeletonKeys("pick", PICKS_DISPLAY_COUNT).map((key) => (
        <PicksCardSkeleton key={key} />
      ))}
    </div>
  </div>
)
