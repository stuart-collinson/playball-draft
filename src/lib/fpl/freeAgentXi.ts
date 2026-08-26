export type XiCandidate = {
  elementId: number
  webName: string
  teamShort: string
  positionType: number
  seasonPoints: number
}

export type FreeAgentXiResult = {
  formation: string
  totalPoints: number
  players: XiCandidate[]
}

const GOALKEEPER = 1
const DEFENDER = 2
const MIDFIELDER = 3
const FORWARD = 4

const FORMATIONS: [number, number, number][] = [
  [3, 4, 3],
  [3, 5, 2],
  [4, 3, 3],
  [4, 4, 2],
  [4, 5, 1],
  [5, 2, 3],
  [5, 3, 2],
  [5, 4, 1],
]

export const computeFreeAgentXi = (candidates: XiCandidate[]): FreeAgentXiResult | null => {
  const byPosition = new Map<number, XiCandidate[]>([
    [GOALKEEPER, []],
    [DEFENDER, []],
    [MIDFIELDER, []],
    [FORWARD, []],
  ])
  for (const candidate of candidates) byPosition.get(candidate.positionType)?.push(candidate)
  for (const list of byPosition.values())
    list.sort((a, b) => b.seasonPoints - a.seasonPoints || a.elementId - b.elementId)

  const keeper = (byPosition.get(GOALKEEPER) ?? [])[0]
  if (!keeper) return null

  let best: FreeAgentXiResult | null = null
  for (const [defenderCount, midfielderCount, forwardCount] of FORMATIONS) {
    const defenders = (byPosition.get(DEFENDER) ?? []).slice(0, defenderCount)
    const midfielders = (byPosition.get(MIDFIELDER) ?? []).slice(0, midfielderCount)
    const forwards = (byPosition.get(FORWARD) ?? []).slice(0, forwardCount)
    if (
      defenders.length < defenderCount ||
      midfielders.length < midfielderCount ||
      forwards.length < forwardCount
    )
      continue
    const players = [keeper, ...defenders, ...midfielders, ...forwards]
    const totalPoints = players.reduce((sum, player) => sum + player.seasonPoints, 0)
    if (!best || totalPoints > best.totalPoints)
      best = {
        formation: `${defenderCount}-${midfielderCount}-${forwardCount}`,
        totalPoints,
        players,
      }
  }
  return best
}
