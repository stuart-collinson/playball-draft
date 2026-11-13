import { isCoinToss, rankGameweekResults } from "@pbd/lib/fpl/gameweek/gameweekResult"
import type { GameweekResult } from "@pbd/lib/fpl/gameweek/gameweekResult"
import type { GameweekReturns } from "@pbd/types/fpl.types"

export type GameweekScore = {
  entryApiId: number
  leagueId: number
  event: number
  points: number
  leaguePoints: number
}

export type GameweekVerdict = {
  leagueId: number
  event: number
  winnerApiId: number
  loserApiId: number
  coinTossApiIds: number[]
  playerApiIds: number[]
}

export type GameweekTiebreakers = {
  returnsFor: (entryApiId: number, event: number) => GameweekReturns
  tablePositionFor: (entryApiId: number) => number | null
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

const toRankedScore = (score: GameweekScore, tiebreakers: GameweekTiebreakers): RankedScore => {
  const scored = tiebreakers.returnsFor(score.entryApiId, score.event)

  return {
    entryApiId: score.entryApiId,
    points: score.points,
    goals: scored.goals,
    cleanSheets: scored.cleanSheets,
    goalsConceded: scored.goalsConceded,
    leaguePoints: score.leaguePoints,
    tablePosition: tiebreakers.tablePositionFor(score.entryApiId) ?? UNRANKED_TABLE_POSITION,
  }
}

export const resolveGameweekVerdicts = (
  scores: GameweekScore[],
  tiebreakers: GameweekTiebreakers,
): GameweekVerdict[] =>
  groupLeagueWeeks(scores).flatMap((week) => {
    const ranked = rankGameweekResults(
      week.scores.map((score) => toRankedScore(score, tiebreakers)),
    )
    const winner = ranked[0]
    const loser = ranked[ranked.length - 1]
    if (!winner || !loser) return []

    const levelWithLoser = ranked.filter((result) => isCoinToss(result, loser))

    return [
      {
        leagueId: week.leagueId,
        event: week.event,
        winnerApiId: winner.entryApiId,
        loserApiId: loser.entryApiId,
        coinTossApiIds:
          levelWithLoser.length > 1 ? levelWithLoser.map((result) => result.entryApiId) : [],
        playerApiIds: week.scores.map((score) => score.entryApiId),
      },
    ]
  })
