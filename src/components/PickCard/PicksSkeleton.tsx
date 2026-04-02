import type { JSX } from "react"
import { Card } from "@pbd/components/ui/card"
import { Skeleton } from "@pbd/components/ui/skeleton"

const SKELETON_COUNT = 12

export const PicksSkeleton = (): JSX.Element => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
      <Card key={i} className="gap-2 p-4">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-20" />
      </Card>
    ))}
  </div>
)
