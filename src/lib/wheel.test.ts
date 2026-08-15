import { WHEEL_CHALLENGES } from "@pbd/lib/constants/Wheel"
import {
  MAX_JITTER_RATIO,
  UINT32_RANGE,
  type Uint32Source,
  computeTargetRotation,
  createSpinOutcome,
  landedIndex,
  pegsPassed,
  pickJitter,
  pickUniformIndex,
  splitLabelLines,
} from "@pbd/lib/wheel"
import { describe, expect, it } from "vitest"

const SEGMENT_COUNT = 5
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT
const MAX_JITTER = SEGMENT_ANGLE * MAX_JITTER_RATIO
const MIN_BOUNDARY_DISTANCE = SEGMENT_ANGLE * (0.5 - MAX_JITTER_RATIO)
const LARGEST_UNBIASED_DRAW = 4294967294
const FIRST_BIASED_DRAW = 4294967295
const FLOAT_TOLERANCE = 1e-9

const START_ROTATIONS = [0, 123.4, 719, 2124, 36000.5]
const JITTERS = [-MAX_JITTER, -12.3, 0, 7.5, MAX_JITTER]

const sourceOf = (values: number[]): Uint32Source => {
  let index = 0
  return () => values[index++] ?? 0
}

const landingAngleOf = (rotation: number): number => ((-rotation % 360) + 360) % 360

describe("pickUniformIndex", () => {
  it("maps a draw onto a segment without shifting the distribution", () => {
    expect(pickUniformIndex(SEGMENT_COUNT, sourceOf([0]))).toBe(0)
    expect(pickUniformIndex(SEGMENT_COUNT, sourceOf([7]))).toBe(2)
    expect(pickUniformIndex(SEGMENT_COUNT, sourceOf([LARGEST_UNBIASED_DRAW]))).toBe(4)
  })

  it("redraws the top-of-range values that would bias the result", () => {
    let draws = 0
    const countingSource: Uint32Source = () => {
      draws++
      return draws === 1 ? FIRST_BIASED_DRAW : 7
    }

    expect(pickUniformIndex(SEGMENT_COUNT, countingSource)).toBe(2)
    expect(draws).toBe(2)
  })

  it("rejects a segment count that is not a positive whole number", () => {
    expect(() => pickUniformIndex(0)).toThrow()
    expect(() => pickUniformIndex(-1)).toThrow()
    expect(() => pickUniformIndex(2.5)).toThrow()
  })

  it("returns an in-range segment from the real crypto source", () => {
    const index = pickUniformIndex(SEGMENT_COUNT)

    expect(Number.isInteger(index)).toBe(true)
    expect(index).toBeGreaterThanOrEqual(0)
    expect(index).toBeLessThan(SEGMENT_COUNT)
  })

  it("reaches every segment across many draws from the real crypto source", () => {
    const seen = new Set<number>()
    for (let draw = 0; draw < 5000; draw++) seen.add(pickUniformIndex(SEGMENT_COUNT))

    expect(seen.size).toBe(SEGMENT_COUNT)
  })
})

describe("pickJitter", () => {
  it("spans the full band from one edge of the safe zone to the other", () => {
    expect(pickJitter(SEGMENT_COUNT, sourceOf([0]))).toBeCloseTo(-MAX_JITTER, 10)
    expect(pickJitter(SEGMENT_COUNT, sourceOf([UINT32_RANGE / 2]))).toBeCloseTo(0, 10)
    expect(pickJitter(SEGMENT_COUNT, sourceOf([FIRST_BIASED_DRAW]))).toBeCloseTo(MAX_JITTER, 7)
  })

  it("never wanders outside the safe band for any draw", () => {
    const draws = [0, 1, 12345, UINT32_RANGE / 4, UINT32_RANGE / 2, LARGEST_UNBIASED_DRAW]

    for (const draw of draws) {
      expect(Math.abs(pickJitter(SEGMENT_COUNT, sourceOf([draw])))).toBeLessThanOrEqual(MAX_JITTER)
    }
  })
})

describe("computeTargetRotation", () => {
  it("settles the first segment under the pointer after five turns from rest", () => {
    expect(computeTargetRotation(0, 0, SEGMENT_COUNT, 0)).toBe(2124)
    expect(landedIndex(2124, SEGMENT_COUNT)).toBe(0)
  })

  it("puts the chosen winner under the pointer from any starting rotation", () => {
    for (const currentRotation of START_ROTATIONS) {
      for (let winnerIndex = 0; winnerIndex < SEGMENT_COUNT; winnerIndex++) {
        for (const jitter of JITTERS) {
          const target = computeTargetRotation(currentRotation, winnerIndex, SEGMENT_COUNT, jitter)

          expect(landedIndex(target, SEGMENT_COUNT)).toBe(winnerIndex)
        }
      }
    }
  })

  it("only ever travels forwards, by five turns plus at most one more", () => {
    for (const currentRotation of START_ROTATIONS) {
      for (let winnerIndex = 0; winnerIndex < SEGMENT_COUNT; winnerIndex++) {
        for (const jitter of JITTERS) {
          const travelled =
            computeTargetRotation(currentRotation, winnerIndex, SEGMENT_COUNT, jitter) -
            currentRotation

          expect(travelled).toBeGreaterThanOrEqual(1800)
          expect(travelled).toBeLessThan(2160)
        }
      }
    }
  })

  it("shortens the journey when fewer turns are asked for", () => {
    for (const currentRotation of START_ROTATIONS) {
      for (let winnerIndex = 0; winnerIndex < SEGMENT_COUNT; winnerIndex++) {
        const target = computeTargetRotation(currentRotation, winnerIndex, SEGMENT_COUNT, 0, 1)
        const travelled = target - currentRotation

        expect(travelled).toBeGreaterThanOrEqual(360)
        expect(travelled).toBeLessThan(720)
        expect(landedIndex(target, SEGMENT_COUNT)).toBe(winnerIndex)
      }
    }
  })
})

describe("landedIndex", () => {
  it("reads the segment sitting under the pointer at twelve o'clock", () => {
    expect(landedIndex(0, SEGMENT_COUNT)).toBe(0)
    expect(landedIndex(324, SEGMENT_COUNT)).toBe(0)
    expect(landedIndex(2124, SEGMENT_COUNT)).toBe(0)
  })

  it("steps back one segment for each boundary the wheel turns past", () => {
    expect(landedIndex(SEGMENT_ANGLE, SEGMENT_COUNT)).toBe(4)
    expect(landedIndex(SEGMENT_ANGLE * 2, SEGMENT_COUNT)).toBe(3)
    expect(landedIndex(SEGMENT_ANGLE * 5, SEGMENT_COUNT)).toBe(0)
  })
})

describe("pegsPassed", () => {
  it("counts one peg for every segment boundary the wheel has turned through", () => {
    expect(pegsPassed(0, SEGMENT_COUNT)).toBe(0)
    expect(pegsPassed(71.9, SEGMENT_COUNT)).toBe(0)
    expect(pegsPassed(72, SEGMENT_COUNT)).toBe(1)
    expect(pegsPassed(2124, SEGMENT_COUNT)).toBe(29)
  })

  it("never counts backwards as the wheel turns forwards", () => {
    let previous = pegsPassed(0, SEGMENT_COUNT)

    for (let rotation = 0; rotation <= 2160; rotation += 7.3) {
      const current = pegsPassed(rotation, SEGMENT_COUNT)

      expect(current).toBeGreaterThanOrEqual(previous)
      previous = current
    }
  })
})

describe("createSpinOutcome", () => {
  it("picks the winner from the first draw, before any rotation is worked out", () => {
    const outcome = createSpinOutcome(0, SEGMENT_COUNT, 5, sourceOf([7, 0]))

    expect(outcome.winnerIndex).toBe(2)
    expect(landedIndex(outcome.targetRotation, SEGMENT_COUNT)).toBe(2)
  })

  it("lands the winner clear of both segment boundaries", () => {
    for (const jitterDraw of [0, 1, UINT32_RANGE / 2, LARGEST_UNBIASED_DRAW]) {
      for (let winnerDraw = 0; winnerDraw < SEGMENT_COUNT; winnerDraw++) {
        const outcome = createSpinOutcome(0, SEGMENT_COUNT, 5, sourceOf([winnerDraw, jitterDraw]))
        const offsetInSegment = landingAngleOf(outcome.targetRotation) % SEGMENT_ANGLE

        expect(offsetInSegment).toBeGreaterThanOrEqual(MIN_BOUNDARY_DISTANCE - FLOAT_TOLERANCE)
        expect(offsetInSegment).toBeLessThanOrEqual(
          SEGMENT_ANGLE - MIN_BOUNDARY_DISTANCE + FLOAT_TOLERANCE,
        )
      }
    }
  })

  it("agrees with the wheel geometry for every segment", () => {
    for (let winnerDraw = 0; winnerDraw < SEGMENT_COUNT; winnerDraw++) {
      const outcome = createSpinOutcome(1234.5, SEGMENT_COUNT, 5, sourceOf([winnerDraw, 999]))

      expect(outcome.winnerIndex).toBe(winnerDraw)
      expect(landedIndex(outcome.targetRotation, SEGMENT_COUNT)).toBe(winnerDraw)
    }
  })
})

describe("splitLabelLines", () => {
  it("keeps short challenges on a single line", () => {
    expect(splitLabelLines("1km Run")).toEqual(["1km Run"])
    expect(splitLabelLines("Song Cover")).toEqual(["Song Cover"])
    expect(splitLabelLines("Sea Swim")).toEqual(["Sea Swim"])
  })

  it("splits long challenges at the point that balances the two lines", () => {
    expect(splitLabelLines("Emoji Challenge")).toEqual(["Emoji", "Challenge"])
    expect(splitLabelLines("Goal and Celebration")).toEqual(["Goal and", "Celebration"])
  })

  it("never breaks a challenge into more than two lines", () => {
    for (const challenge of WHEEL_CHALLENGES) {
      expect(splitLabelLines(challenge).length).toBeLessThanOrEqual(2)
    }
  })
})
