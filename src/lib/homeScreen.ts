import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import type { LeagueOutcome, OutcomeEntry } from "@pbd/lib/fpl/gameweekOutcome"

export type ForfeitStatus =
  | { state: "unknown" }
  | { state: "pending" }
  | { state: "complete"; title: string; href: string }

export type GameweekForfeit = {
  id: string
  person: string
  league: LeagueSlug
  title: string
}

const RESULT_PLACEHOLDER = "TBC"

export const padGameweek = (gameweek: number): string => String(gameweek).padStart(2, "0")

export const resolveForfeitStatus = (
  loser: OutcomeEntry | null,
  league: LeagueSlug,
  forfeits: GameweekForfeit[] | null,
): ForfeitStatus => {
  if (loser === null || forfeits === null) return { state: "unknown" }

  const filed = forfeits.find(
    (forfeit) => forfeit.person === loser.slug && forfeit.league === league,
  )
  if (!filed) return { state: "pending" }

  return { state: "complete", title: filed.title, href: `/forfeits/${league}/${filed.id}` }
}

const winnerLabel = (outcome: LeagueOutcome): string =>
  outcome.winner ? `${outcome.winner.name} ${outcome.winner.points}` : RESULT_PLACEHOLDER

type ForfeitStatusCopy = {
  headline: string
  detail: string
  href: string | null
}

const FORFEIT_STATUS_COPY: Record<"unknown" | "pending", ForfeitStatusCopy> = {
  unknown: { headline: "Forfeit due", detail: "Unlock forfeits to track", href: null },
  pending: { headline: "Forfeit pending", detail: "Awaiting evidence", href: null },
}

export const forfeitStatusCopy = (status: ForfeitStatus): ForfeitStatusCopy =>
  status.state === "complete"
    ? { headline: status.title, detail: "Evidence filed", href: status.href }
    : FORFEIT_STATUS_COPY[status.state]

export const winnersLine = (premiership: LeagueOutcome, championship: LeagueOutcome): string =>
  `${winnerLabel(premiership)} · ${winnerLabel(championship)}`
