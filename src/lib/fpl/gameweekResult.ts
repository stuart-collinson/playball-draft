export type GameweekResult = {
  points: number
  goals: number
  tableRank: number
}

export const compareGameweekResults = (first: GameweekResult, second: GameweekResult): number => {
  if (first.points !== second.points) return second.points - first.points
  if (first.goals !== second.goals) return second.goals - first.goals
  return first.tableRank - second.tableRank
}
