const MIN_GAMEWEEK_SPAN = 6

const MAX_TICKS = 13

const TICK_STEPS = [1, 2, 3, 5] as const

const FALLBACK_TICK_STEP = 5

const COLLIDING_GAP_RATIO = 0.5

const SPARSE_GAMEWEEK_COUNT = 10

export const getGameweekAxisMax = (latestEvent: number): number =>
  Math.max(latestEvent, MIN_GAMEWEEK_SPAN)

export const getTickStep = (axisMax: number): number => {
  const span = Math.max(1, axisMax - 1)
  const fitting = TICK_STEPS.find((step) => Math.floor(span / step) + 1 <= MAX_TICKS)

  return fitting ?? FALLBACK_TICK_STEP
}

export const buildGameweekTicks = (latestEvent: number): number[] => {
  const axisMax = getGameweekAxisMax(latestEvent)
  const step = getTickStep(axisMax)

  const ticks: number[] = []
  for (let gameweek = 1; gameweek <= axisMax; gameweek += step) ticks.push(gameweek)

  const last = ticks[ticks.length - 1]
  if (last !== undefined && last !== axisMax) {
    const collides = (axisMax - last) / step <= COLLIDING_GAP_RATIO
    const overBudget = ticks.length + 1 > MAX_TICKS

    if (collides || overBudget) ticks.pop()
    ticks.push(axisMax)
  }

  return ticks
}

export const shouldShowDots = (gameweekCount: number): boolean =>
  gameweekCount > 0 && gameweekCount <= SPARSE_GAMEWEEK_COUNT
