"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import type { JSX } from "react"
import { LEAGUE_IDS, LEAGUE_LABELS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl"
import type { LeagueDetailsResponse, Standing } from "@pbd/types/fpl.types"
import { useTRPC } from "@pbd/trpc/react"

type GwResult = {
  managerName: string
  teamName: string
  points: number
}

const getExtremeStanding = (
  data: LeagueDetailsResponse,
  type: "winner" | "loser",
): GwResult | null => {
  if (!data.standings.length) return null
  const sorted = [...data.standings].sort((a, b) =>
    type === "winner" ? b.event_total - a.event_total : a.event_total - b.event_total,
  )
  const standing = sorted[0] as Standing
  const entry = data.league_entries.find((e) => e.id === standing.league_entry)
  return {
    managerName: entry ? `${entry.player_first_name} ${entry.player_last_name}` : "Unknown",
    teamName: entry?.entry_name ?? "Unknown",
    points: standing.event_total,
  }
}

type CardProps = {
  result: GwResult
  type: "winner" | "loser"
  leagueSlug: "premiership" | "championship"
}

const GwCard = ({ result, type, leagueSlug }: CardProps): JSX.Element => {
  const isPrem = leagueSlug === "premiership"
  const isWinner = type === "winner"

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isPrem ? "bg-prem-900 text-prem-400" : "bg-champ-900 text-champ-400"
          }`}
        >
          {LEAGUE_LABELS[leagueSlug]}
        </span>
        <span className="text-2xl">{isWinner ? "🏆" : "💩"}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{result.managerName}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{result.teamName}</p>
      <p className="mt-3 text-3xl font-black tabular-nums text-foreground">
        {result.points}
        <span className="ml-1 text-base font-medium text-muted-foreground">pts</span>
      </p>
    </div>
  )
}

export const GwWinnerCards = (): JSX.Element => {
  const trpc = useTRPC()
  const { data: premData } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
  )
  const { data: champData } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_SLUG_TO_ID.championship }),
  )

  const premWinner = getExtremeStanding(premData, "winner")
  const champWinner = getExtremeStanding(champData, "winner")

  return (
    <section className="animate-fade-up-delay-3">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        This Gameweek · Winners
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {premWinner && <GwCard result={premWinner} type="winner" leagueSlug="premiership" />}
        {champWinner && <GwCard result={champWinner} type="winner" leagueSlug="championship" />}
      </div>
    </section>
  )
}

export const GwLoserCards = (): JSX.Element => {
  const trpc = useTRPC()
  const { data: premData } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
  )
  const { data: champData } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_SLUG_TO_ID.championship }),
  )

  const premLoser = getExtremeStanding(premData, "loser")
  const champLoser = getExtremeStanding(champData, "loser")

  return (
    <section className="animate-fade-up-delay-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        This Gameweek · Losers
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {premLoser && <GwCard result={premLoser} type="loser" leagueSlug="premiership" />}
        {champLoser && <GwCard result={champLoser} type="loser" leagueSlug="championship" />}
      </div>
    </section>
  )
}
