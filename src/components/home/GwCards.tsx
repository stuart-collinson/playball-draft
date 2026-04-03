"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import type { JSX } from "react"
import { LEAGUE_IDS, LEAGUE_LABELS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl"
import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"
import { ResultAvatar } from "@pbd/components/ResultAvatar"
import type { LeagueDetailsResponse, Standing } from "@pbd/types/fpl.types"
import { useTRPC } from "@pbd/trpc/react"

type GwResult = {
  name: string
  points: number
  image: string | null
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
  const participant = entry ? PARTICIPANT_BY_API_ID[entry.id] : null
  return {
    name: participant?.name ?? (entry ? `${entry.player_first_name} ${entry.player_last_name}` : "Unknown"),
    points: standing.event_total,
    image: participant?.image ?? null,
  }
}

type SpotlightProps = {
  result: GwResult | null
  type: "winner" | "loser"
  leagueSlug: LeagueSlug
}

const Spotlight = ({ result, type, leagueSlug }: SpotlightProps): JSX.Element => {
  const isWinner = type === "winner"
  const ptColor = isWinner ? "text-green-400" : "text-red-400"
  const glowColor = isWinner ? "bg-green-500" : "bg-red-500"

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-4 py-6">
      <div className="relative">
        <div className={`absolute inset-0 scale-[1.6] rounded-full blur-2xl opacity-25 ${glowColor}`} />
        {result?.image ? (
          <ResultAvatar imageUrl={result.image} type={type} size="lg" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-muted" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-bold leading-tight text-foreground">{result?.name ?? "—"}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{LEAGUE_LABELS[leagueSlug]}</p>
        <p className={`mt-2 text-3xl font-black tabular-nums ${ptColor}`}>
          {result?.points ?? "—"}
          <span className="ml-1 text-sm font-medium text-muted-foreground">pts</span>
        </p>
      </div>
    </div>
  )
}

type ResultSectionProps = {
  type: "winner" | "loser"
  premResult: GwResult | null
  champResult: GwResult | null
}

const ResultSection = ({ type, premResult, champResult }: ResultSectionProps): JSX.Element => {
  const isWinner = type === "winner"
  const labelColor = isWinner ? "text-green-400" : "text-red-400"
  const ruleColor = isWinner ? "bg-green-500/20" : "bg-red-500/20"
  const label = isWinner ? "HEROES" : "ZEROS"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className={`shrink-0 text-xs font-black uppercase tracking-[0.3em] ${labelColor}`}>
          {label}
        </span>
        <div className={`h-px flex-1 ${ruleColor}`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Spotlight result={premResult} type={type} leagueSlug="premiership" />
        <Spotlight result={champResult} type={type} leagueSlug="championship" />
      </div>
    </div>
  )
}

export const GwWeeklyResults = (): JSX.Element => {
  const trpc = useTRPC()
  const { data: premData } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
  )
  const { data: champData } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_SLUG_TO_ID.championship }),
  )

  return (
    <div className="animate-fade-up-delay-2 flex flex-col gap-8">
      <ResultSection
        type="winner"
        premResult={getExtremeStanding(premData, "winner")}
        champResult={getExtremeStanding(champData, "winner")}
      />
      <ResultSection
        type="loser"
        premResult={getExtremeStanding(premData, "loser")}
        champResult={getExtremeStanding(champData, "loser")}
      />
    </div>
  )
}
