import { resolveMediaType } from "@pbd/lib/mediaFile"
import { describe, expect, it } from "vitest"

describe("resolveMediaType", () => {
  it("keeps a browser-supplied video mime", () => {
    expect(resolveMediaType("clip.mp4", "video/mp4")).toEqual({ mime: "video/mp4", kind: "video" })
  })

  it("falls back to the extension when the browser reports no type", () => {
    expect(resolveMediaType("IMG_2026.MP4", "")).toEqual({ mime: "video/mp4", kind: "video" })
  })

  it("falls back to the extension for an octet-stream airdrop", () => {
    expect(resolveMediaType("clip.mov", "application/octet-stream")).toEqual({
      mime: "video/quicktime",
      kind: "video",
    })
  })

  it("resolves a quicktime file by extension", () => {
    expect(resolveMediaType("clip.MOV", "")).toEqual({ mime: "video/quicktime", kind: "video" })
  })

  it("resolves a jpeg by extension", () => {
    expect(resolveMediaType("photo.JPG", "")).toEqual({ mime: "image/jpeg", kind: "photo" })
  })

  it("resolves the jpeg alias extension", () => {
    expect(resolveMediaType("photo.jpeg", "")).toEqual({ mime: "image/jpeg", kind: "photo" })
  })

  it("resolves png and webp as photos", () => {
    expect(resolveMediaType("x.png", "")?.mime).toBe("image/png")
    expect(resolveMediaType("x.webp", "")?.kind).toBe("photo")
  })

  it("rejects an unsupported type", () => {
    expect(resolveMediaType("x.gif", "image/gif")).toBeNull()
  })

  it("rejects a file with no extension and no usable type", () => {
    expect(resolveMediaType("noext", "")).toBeNull()
  })
})
