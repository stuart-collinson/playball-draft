import { HomeScreenSkeleton } from "@pbd/components/Home/HomeScreenSkeleton"
import { Skeleton } from "@pbd/components/ui/skeleton"
import { HOME_SCREENS } from "@pbd/lib/constants/Home"
import type { JSX } from "react"

export const HomePageSkeleton = (): JSX.Element => (
  <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
    <div className="flex gap-1.5">
      {HOME_SCREENS.map(({ key }) => (
        <Skeleton key={key} className="h-9 flex-1 rounded-full" />
      ))}
    </div>
    <HomeScreenSkeleton />
  </div>
)
