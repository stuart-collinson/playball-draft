"use client"

import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { HomeScreenBody } from "@pbd/components/Home/HomeScreenBody"
import { HomeScreenFit } from "@pbd/components/Home/HomeScreenFit"
import { HomeScreenSkeleton } from "@pbd/components/Home/HomeScreenSkeleton"
import { HomeScreenTabs } from "@pbd/components/Home/HomeScreenTabs"
import { DEFAULT_HOME_SCREEN, HOME_FRAME_CLASSES } from "@pbd/lib/constants/Home"
import type { HomeScreenKey } from "@pbd/lib/constants/Home"
import type { JSX } from "react"
import { Suspense, useState } from "react"

type Props = {
  canViewForfeits: boolean
}

export const HomeScreens = ({ canViewForfeits }: Props): JSX.Element => {
  const [screen, setScreen] = useState<HomeScreenKey>(DEFAULT_HOME_SCREEN)

  return (
    <div className={HOME_FRAME_CLASSES}>
      <div className="shrink-0 px-4 sm:px-0">
        <HomeScreenTabs active={screen} onSelect={setScreen} />
      </div>
      <HomeScreenFit>
        <DataErrorBoundary
          title="No Results Yet"
          message="Fantasy Premier League didn't return this gameweek's results."
        >
          <Suspense fallback={<HomeScreenSkeleton />}>
            <HomeScreenBody screen={screen} canViewForfeits={canViewForfeits} />
          </Suspense>
        </DataErrorBoundary>
      </HomeScreenFit>
    </div>
  )
}
