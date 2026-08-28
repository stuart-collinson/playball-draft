import { isHeicFile } from "@pbd/lib/heic"
import { describe, expect, it } from "vitest"

const fileNamed = (name: string, type: string): File =>
  new File([new Uint8Array([1])], name, { type })

describe("isHeicFile", () => {
  it("detects a heic mime type", () => {
    expect(isHeicFile(fileNamed("photo.heic", "image/heic"))).toBe(true)
  })

  it("detects a heif mime type", () => {
    expect(isHeicFile(fileNamed("photo", "image/heif"))).toBe(true)
  })

  it("detects by extension when the browser reports no type", () => {
    expect(isHeicFile(fileNamed("IMG_2026.HEIC", ""))).toBe(true)
  })

  it("detects a .heif extension", () => {
    expect(isHeicFile(fileNamed("photo.heif", ""))).toBe(true)
  })

  it("passes a normal jpeg through", () => {
    expect(isHeicFile(fileNamed("photo.jpg", "image/jpeg"))).toBe(false)
  })

  it("passes a video through", () => {
    expect(isHeicFile(fileNamed("clip.mp4", "video/mp4"))).toBe(false)
  })
})
