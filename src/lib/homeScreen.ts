import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
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

type ShareSnapshot = {
  gameweek: number
  premiership: LeagueOutcome
  championship: LeagueOutcome
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

const loserLabel = (outcome: LeagueOutcome, league: LeagueSlug): string =>
  outcome.loser
    ? `${outcome.loser.name} (${LEAGUE_LABELS[league]}, ${outcome.loser.points} pts)`
    : `${RESULT_PLACEHOLDER} (${LEAGUE_LABELS[league]})`

const winnerLabel = (outcome: LeagueOutcome): string =>
  outcome.winner ? `${outcome.winner.name} ${outcome.winner.points}` : RESULT_PLACEHOLDER

export const buildHomeShareText = ({
  gameweek,
  premiership,
  championship,
}: ShareSnapshot): string =>
  [
    `GW${padGameweek(gameweek)} forfeits: ${loserLabel(premiership, "premiership")} and ${loserLabel(championship, "championship")}.`,
    `Winners: ${winnerLabel(premiership)} and ${winnerLabel(championship)}.`,
    `${LEAGUE_LABELS.premiership} ${premiership.total} v ${LEAGUE_LABELS.championship} ${championship.total}.`,
  ].join(" ")

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
