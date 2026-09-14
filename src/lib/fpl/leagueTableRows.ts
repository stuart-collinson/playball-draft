import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/Participants"
import { compareStandingsByGameweek } from "@pbd/lib/fpl/gameweekResult"
import { gameweekPointsFor } from "@pbd/lib/fpl/livePoints"
import type { GoalsAndAssists, LeagueDetailsResponse, Standing } from "@pbd/types/fpl.types"

export type LeagueTableMode = "total" | "form"

export type LeagueTableRow = {
  leagueEntryId: number
  leagueId: number
  rank: number
  lastRank: number
  playerName: string
  teamName: string
  total: number
  gameweekScore: number
  averagePoints: number
  toPlay: number
}

type BuildInput = {
  leagues: LeagueDetailsResponse[]
  mode: LeagueTableMode
  gameweeksPlayed: number
  toPlayMap: Record<number, number>
  returnsMap: Record<number, GoalsAndAssists>
  pointsMap: Record<number, number>
}

type LeagueStanding = {
  leagueId: number
  standing: Standing
}

const UNKNOWN = "Unknown"

const compareByTotal = (first: LeagueStanding, second: LeagueStanding): number =>
  second.standing.total - first.standing.total || first.standing.rank - second.standing.rank

const compareByGameweek = (
  returnsMap: Record<number, GoalsAndAssists>,
  pointsMap: Record<number, number>,
): ((first: LeagueStanding, second: LeagueStanding) => number) => {
  const byGameweek = compareStandingsByGameweek(returnsMap, pointsMap)

  return (first, second) => byGameweek(first.standing, second.standing)
}

export const countGameweeksPlayed = (currentEvent: number | null, startEvent: number): number => {
  if (currentEvent === null) return 0
  return Math.max(currentEvent - startEvent + 1, 0)
}

export const buildLeagueTableRows = ({
  leagues,
  mode,
  gameweeksPlayed,
  toPlayMap,
  returnsMap,
  pointsMap,
}: BuildInput): LeagueTableRow[] => {
  const teamNames = new Map(
    leagues
      .flatMap((league) => league.league_entries)
      .map((entry) => [entry.id, entry.entry_name] as const),
  )

  const leagueStandings = leagues.flatMap((league) =>
    league.standings.map((standing) => ({ leagueId: league.league.id, standing })),
  )

  const keepsOfficialRanks = mode === "total" && leagues.length === 1

  const sorted = [...leagueStandings].sort(
    mode === "total" ? compareByTotal : compareByGameweek(returnsMap, pointsMap),
  )

  return sorted.map(({ leagueId, standing }, index) => ({
    leagueEntryId: standing.league_entry,
    leagueId,
    rank: keepsOfficialRanks ? standing.rank : index + 1,
    lastRank: keepsOfficialRanks ? standing.last_rank : 0,
    playerName: PARTICIPANT_BY_API_ID[standing.league_entry]?.name ?? UNKNOWN,
    teamName: teamNames.get(standing.league_entry) ?? UNKNOWN,
    total: standing.total,
    gameweekScore: gameweekPointsFor(standing.event_total, pointsMap[standing.league_entry]),
    averagePoints: gameweeksPlayed > 0 ? standing.total / gameweeksPlayed : 0,
    toPlay: toPlayMap[standing.league_entry] ?? 0,
  }))
}
