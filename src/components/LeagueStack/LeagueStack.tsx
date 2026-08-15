import type { JSX, ReactNode } from "react"

type Props = {
  leagueIds: number[]
  gap?: "tight" | "loose"
  children: (leagueId: number) => ReactNode
}

export const LeagueStack = ({ leagueIds, gap = "tight", children }: Props): JSX.Element => (
  <div className={`flex flex-col ${gap === "loose" ? "gap-8" : "gap-6"}`}>
    {leagueIds.map((leagueId) => (
      <div key={leagueId}>{children(leagueId)}</div>
    ))}
  </div>
)
