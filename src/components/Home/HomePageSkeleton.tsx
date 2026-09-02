import { HomeScreenSkeleton } from "@pbd/components/Home/HomeScreenSkeleton"
import { Skeleton } from "@pbd/components/ui/skeleton"
import { HOME_FRAME_CLASSES, HOME_SCREENS, HOME_SCREEN_BOX_CLASSES } from "@pbd/lib/constants/Home"
import type { JSX } from "react"

export const HomePageSkeleton = (): JSX.Element => (
  <div className={HOME_FRAME_CLASSES}>
    <div className="flex shrink-0 gap-1.5 px-4 sm:px-0">
      {HOME_SCREENS.map(({ key }) => (
        <Skeleton key={key} className="h-9 flex-1 rounded-full" />
      ))}
    </div>
    <div className={HOME_SCREEN_BOX_CLASSES}>
      <HomeScreenSkeleton />
    </div>
  </div>
)
