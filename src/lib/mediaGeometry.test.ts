import { squareCrop } from "@pbd/lib/mediaGeometry"
import { describe, expect, it } from "vitest"

describe("squareCrop", () => {
  it("crops a landscape frame to a centred square", () => {
    expect(squareCrop(400, 300)).toEqual({ sourceX: 50, sourceY: 0, sourceSize: 300 })
  })

  it("crops a portrait frame to a centred square", () => {
    expect(squareCrop(300, 500)).toEqual({ sourceX: 0, sourceY: 100, sourceSize: 300 })
  })

  it("leaves a square frame untouched", () => {
    expect(squareCrop(320, 320)).toEqual({ sourceX: 0, sourceY: 0, sourceSize: 320 })
  })

  it("floors fractional offsets so canvas coordinates stay integral", () => {
    expect(squareCrop(401, 300)).toEqual({ sourceX: 50, sourceY: 0, sourceSize: 300 })
  })
})
