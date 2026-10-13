import { cn } from "@pbd/lib/className"
import type { JSX, ReactNode } from "react"

type Props = {
  isFinal: boolean
  children: ReactNode
}

export const CupRoundPanel = ({ isFinal, children }: Props): JSX.Element => (
  <section
    className={cn(
      "rounded-2xl border border-border/60 bg-card/40 p-3",
      isFinal && "border-amber-400/30 bg-amber-400/5",
    )}
  >
    {children}
  </section>
)
