import { isUniformFrame } from "@pbd/lib/mediaPixels"
import { describe, expect, it } from "vitest"

const frameOf = (...pixels: number[][]): Uint8ClampedArray => new Uint8ClampedArray(pixels.flat())

describe("isUniformFrame", () => {
  it("treats a fully transparent draw as uniform", () => {
    expect(isUniformFrame(frameOf([0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]))).toBe(true)
  })

  it("treats a solid colour as uniform", () => {
    expect(isUniformFrame(frameOf([39, 39, 42, 255], [39, 39, 42, 255]))).toBe(true)
  })

  it("treats a single differing pixel as a real frame", () => {
    expect(isUniformFrame(frameOf([12, 12, 12, 255], [12, 12, 13, 255]))).toBe(false)
  })

  it("ignores alpha so an opaque black frame still counts as uniform", () => {
    expect(isUniformFrame(frameOf([0, 0, 0, 255], [0, 0, 0, 128]))).toBe(true)
  })

  it("treats an empty frame as uniform", () => {
    expect(isUniformFrame(new Uint8ClampedArray())).toBe(true)
  })
})
