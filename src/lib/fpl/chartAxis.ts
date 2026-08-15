// A season-long chart drawn in September is mostly empty canvas, so the axis
// tracks the gameweeks actually played rather than the full 38. These are the
// derivations that let it grow on its own as gameweeks complete.

// Below this, the axis holds a minimum span — two points stretched across a
// wide canvas looks as odd as two points crammed into the corner of one.
const MIN_GAMEWEEK_SPAN = 6

// The density the full-season chart settles at: 13 labels across 38 gameweeks.
const MAX_TICKS = 13

// Steps climb this ladder until the labels fit under MAX_TICKS. Reaching 38
// gameweeks lands on 3, which reproduces the every-third-gameweek axis the
// chart has always ended the season with.
const TICK_STEPS = [1, 2, 3, 5] as const

// Used when even the widest step cannot fit the budget. Unreachable for a
// 38-gameweek season, but keeps the step lookup total.
const FALLBACK_TICK_STEP = 5

// The final gameweek is always labelled. Drop the tick before it when the two
// would sit close enough to collide.
const COLLIDING_GAP_RATIO = 0.5

// Sparse charts read better with their points marked; once the season fills in,
// the dots turn into noise and the line alone is cleaner.
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
    // The step keeps the generated ticks within budget, but appending the
    // final gameweek can still tip it over — drop the one before it if so.
    const overBudget = ticks.length + 1 > MAX_TICKS

    if (collides || overBudget) ticks.pop()
    ticks.push(axisMax)
  }

  return ticks
}

export const shouldShowDots = (gameweekCount: number): boolean =>
  gameweekCount > 0 && gameweekCount <= SPARSE_GAMEWEEK_COUNT
