import { createContext } from "react"

export type HomeScreenFitValue = {
  showLineups: boolean
}

export const HomeScreenFitContext = createContext<HomeScreenFitValue | undefined>(undefined)
