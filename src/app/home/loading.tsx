import { GameweekResultsSkeleton } from "@pbd/components/GameweekResultsSkeleton"
import { HomeHero } from "@pbd/components/HomeHero/HomeHero"
import type { JSX } from "react"

const HomeLoading = (): JSX.Element => (
  <div className="flex flex-col gap-4">
    <HomeHero />
    <GameweekResultsSkeleton />
  </div>
)

export default HomeLoading
