import { rankGameweekResults } from "@pbd/lib/fpl/gameweekResult"
import type { GameweekResult } from "@pbd/lib/fpl/gameweekResult"

export type GameweekScore = {
  entryApiId: number
  leagueId: number
  event: number
  points: number
}

export type GameweekVerdict = {
  leagueId: number
  event: number
  winnerApiId: number
  loserApiId: number
  playerApiIds: number[]
}

export type GameweekTiebreakers = {
  goalsFor: (entryApiId: number, event: number) => number
  tableRankFor: (entryApiId: number) => number | null
}

export type TiedGameweek = {
  event: number
  entryApiIds: number[]
}

type LeagueWeek = {
  leagueId: number
  event: number
  scores: GameweekScore[]
}

type RankedScore = GameweekResult & { entryApiId: number }

const UNRANKED_TABLE_POSITION = Number.MAX_SAFE_INTEGER

const groupLeagueWeeks = (scores: GameweekScore[]): LeagueWeek[] => {
  const weeks = new Map<string, LeagueWeek>()
  for (const score of scores) {
    const key = `${score.leagueId}-${score.event}`
    const week = weeks.get(key) ?? { leagueId: score.leagueId, event: score.event, scores: [] }
    week.scores.push(score)
    weeks.set(key, week)
  }

  return [...weeks.values()]
}

const tiedAtExtremes = (scores: GameweekScore[]): number[] => {
  const points = scores.map((score) => score.points)
  const tiedAt = (value: number): number[] => {
    const tied = scores.filter((score) => score.points === value)
    return tied.length > 1 ? tied.map((score) => score.entryApiId) : []
  }

  return [...new Set([...tiedAt(Math.max(...points)), ...tiedAt(Math.min(...points))])]
}

export const findTiedGameweeks = (scores: GameweekScore[]): TiedGameweek[] => {
  const tiedByEvent = new Map<number, number[]>()
  for (const week of groupLeagueWeeks(scores)) {
    const tied = tiedAtExtremes(week.scores)
    if (tied.length === 0) continue
    tiedByEvent.set(week.event, [...(tiedByEvent.get(week.event) ?? []), ...tied])
  }

  return [...tiedByEvent]
    .map(([event, entryApiIds]) => ({ event, entryApiIds }))
    .sort((first, second) => first.event - second.event)
}

export const resolveGameweekVerdicts = (
  scores: GameweekScore[],
  tiebreakers: GameweekTiebreakers,
): GameweekVerdict[] =>
  groupLeagueWeeks(scores).flatMap((week) => {
    const ranked = rankGameweekResults<RankedScore>(
      week.scores.map((score) => ({
        entryApiId: score.entryApiId,
        points: score.points,
        goals: tiebreakers.goalsFor(score.entryApiId, week.event),
        tableRank: tiebreakers.tableRankFor(score.entryApiId) ?? UNRANKED_TABLE_POSITION,
      })),
    )
    const winner = ranked[0]
    const loser = ranked[ranked.length - 1]
    if (!winner || !loser) return []

    return [
      {
        leagueId: week.leagueId,
        event: week.event,
        winnerApiId: winner.entryApiId,
        loserApiId: loser.entryApiId,
        playerApiIds: week.scores.map((score) => score.entryApiId),
      },
    ]
  })
