import { forfeitBlobPaths, isForfeitBlobPath } from "@pbd/lib/forfeitsPaths"
import { describe, expect, it } from "vitest"

describe("forfeitBlobPaths", () => {
  it("builds media and thumbnail paths under the season and gameweek", () => {
    expect(forfeitBlobPaths({ season: "2026/27", gameweek: "3", mediaExtension: "mp4" })).toEqual({
      mediaPath: "forfeits/2026-27/gw3/media.mp4",
      thumbPath: "forfeits/2026-27/gw3/thumb.jpg",
    })
  })

  it("uses an annual segment for annual forfeits", () => {
    expect(
      forfeitBlobPaths({ season: "2026/27", gameweek: "annual", mediaExtension: "jpg" }),
    ).toEqual({
      mediaPath: "forfeits/2026-27/annual/media.jpg",
      thumbPath: "forfeits/2026-27/annual/thumb.jpg",
    })
  })
})

describe("isForfeitBlobPath", () => {
  it("accepts a path inside the forfeits folder", () => {
    expect(isForfeitBlobPath("forfeits/2026-27/gw3/media-abc123.mp4")).toBe(true)
  })

  it("rejects a path outside the forfeits folder", () => {
    expect(isForfeitBlobPath("participants/photo.jpg")).toBe(false)
  })

  it("rejects traversal attempts", () => {
    expect(isForfeitBlobPath("forfeits/../secrets/file.mp4")).toBe(false)
  })

  it("rejects unexpected characters", () => {
    expect(isForfeitBlobPath("forfeits/2026-27/gw3/<script>.mp4")).toBe(false)
  })
})
