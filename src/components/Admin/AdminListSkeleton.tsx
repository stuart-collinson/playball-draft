import { Item, ItemActions, ItemContent, ItemMedia } from "@pbd/components/ui/item"
import { Skeleton } from "@pbd/components/ui/skeleton"
import { skeletonKeys } from "@pbd/lib/skeletonKeys"
import type { JSX } from "react"

type Props = {
  rowCount: number
}

export const AdminListSkeleton = ({ rowCount }: Props): JSX.Element => (
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
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
        </ItemActions>
      </Item>
    ))}
  </div>
)
