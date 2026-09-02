import { HomeScreenFitContext } from "@pbd/components/Home/HomeScreenFitContext"
import type { HomeScreenFitValue } from "@pbd/components/Home/HomeScreenFitContext"
import { use } from "react"

export const useHomeScreenFit = (): HomeScreenFitValue => {
  const context = use(HomeScreenFitContext)
  if (!context) throw new Error("useHomeScreenFit must be used within <HomeScreenFit>")
  return context
}
