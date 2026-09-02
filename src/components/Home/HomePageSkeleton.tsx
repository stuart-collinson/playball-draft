import { HomeScreenSkeleton } from "@pbd/components/Home/HomeScreenSkeleton"
import { Skeleton } from "@pbd/components/ui/skeleton"
import { HOME_SCREENS } from "@pbd/lib/constants/Home"
import type { JSX } from "react"

export const HomePageSkeleton = (): JSX.Element => (
  <div className="-mx-4 flex flex-col gap-4 sm:mx-0">
    <div className="flex gap-1.5 px-4 sm:px-0">
      {HOME_SCREENS.map(({ key }) => (
        <Skeleton key={key} className="h-9 flex-1 rounded-full" />
      ))}
    </div>
    <HomeScreenSkeleton />
  </div>
)
