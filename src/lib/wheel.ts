export type Uint32Source = () => number

export type SpinOutcome = {
  winnerIndex: number
  targetRotation: number
}

export const UINT32_RANGE = 4294967296
export const WHEEL_FULL_TURNS = 9
export const MAX_JITTER_RATIO = 0.35

const cryptoUint32: Uint32Source = () => crypto.getRandomValues(new Uint32Array(1))[0] ?? 0

const assertSegmentCount = (segmentCount: number): void => {
  if (!Number.isInteger(segmentCount) || segmentCount <= 0) {
    throw new Error(`segmentCount must be a positive integer, received ${segmentCount}`)
  }
}

const normalizeDegrees = (degrees: number): number => ((degrees % 360) + 360) % 360

export const pickUniformIndex = (
  segmentCount: number,
  nextUint32: Uint32Source = cryptoUint32,
): number => {
  assertSegmentCount(segmentCount)

  const unbiasedLimit = Math.floor(UINT32_RANGE / segmentCount) * segmentCount
  let draw = nextUint32()
  while (draw >= unbiasedLimit) draw = nextUint32()

  return draw % segmentCount
}

export const pickJitter = (
  segmentCount: number,
  nextUint32: Uint32Source = cryptoUint32,
): number => {
  assertSegmentCount(segmentCount)

  const maxJitter = (360 / segmentCount) * MAX_JITTER_RATIO

  return (nextUint32() / UINT32_RANGE) * 2 * maxJitter - maxJitter
}

export const computeTargetRotation = (
  currentRotation: number,
  winnerIndex: number,
  segmentCount: number,
  jitter: number,
  fullTurns: number = WHEEL_FULL_TURNS,
): number => {
  const segmentAngle = 360 / segmentCount
  const winnerAngle = winnerIndex * segmentAngle + segmentAngle / 2 + jitter
  const restingRotation = normalizeDegrees(360 - winnerAngle)
  const delta = normalizeDegrees(restingRotation - normalizeDegrees(currentRotation))

  return currentRotation + fullTurns * 360 + delta
}

export const landedIndex = (rotation: number, segmentCount: number): number =>
  Math.floor(normalizeDegrees(-rotation) / (360 / segmentCount))

export const pegsPassed = (rotation: number, segmentCount: number): number =>
  Math.floor(rotation / (360 / segmentCount))

export const createSpinOutcome = (
  currentRotation: number,
  segmentCount: number,
  fullTurns: number = WHEEL_FULL_TURNS,
  nextUint32: Uint32Source = cryptoUint32,
): SpinOutcome => {
  const winnerIndex = pickUniformIndex(segmentCount, nextUint32)
  const jitter = pickJitter(segmentCount, nextUint32)
  const targetRotation = computeTargetRotation(
    currentRotation,
    winnerIndex,
    segmentCount,
    jitter,
    fullTurns,
  )

  return { winnerIndex, targetRotation }
}
