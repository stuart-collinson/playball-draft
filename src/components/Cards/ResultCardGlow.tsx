import { BorderGlow } from "@pbd/components/ui/BorderGlow/border-glow"
import type { JSX, ReactNode } from "react"

type ResultCardGlowProps = {
  children: ReactNode
}

export const ResultCardGlow = ({ children }: ResultCardGlowProps): JSX.Element => (
  <BorderGlow
    edgeSensitivity={30}
    glowColor="40 80 80"
    backgroundColor="#060010"
    borderRadius={28}
    glowRadius={40}
    glowIntensity={1}
    coneSpread={25}
    animated={false}
    colors={["#c084fc", "#f472b6", "#38bdf8"]}
  >
    {children}
  </BorderGlow>
)
