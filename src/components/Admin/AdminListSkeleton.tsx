import { Item, ItemActions, ItemContent, ItemMedia } from "@pbd/components/ui/item"
import { Skeleton } from "@pbd/components/ui/skeleton"
import { skeletonKeys } from "@pbd/lib/skeletonKeys"
import type { JSX } from "react"

type Props = {
  rowCount: number
  actionCount?: number
}

const DEFAULT_ACTION_COUNT = 2

export const AdminListSkeleton = ({
  rowCount,
  actionCount = DEFAULT_ACTION_COUNT,
}: Props): JSX.Element => (
  <div className="flex flex-col gap-2">
    {skeletonKeys("admin-row", rowCount).map((key) => (
      <Item key={key} variant="outline" size="sm" className="rounded-xl bg-card px-3">
        <ItemMedia>
          <Skeleton className="size-14 rounded-lg" />
        </ItemMedia>
        <ItemContent className="min-w-0 gap-1.5">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-3/5" />
          <Skeleton className="h-3 w-1/4" />
        </ItemContent>
        <ItemActions className="gap-0.5">
          {skeletonKeys(`${key}-action`, actionCount).map((actionKey) => (
            <Skeleton key={actionKey} className="size-9 rounded-md" />
          ))}
        </ItemActions>
      </Item>
    ))}
  </div>
)
