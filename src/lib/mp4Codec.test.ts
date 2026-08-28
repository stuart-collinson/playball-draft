import { detectMp4VideoCodec } from "@pbd/lib/mp4Codec"
import { describe, expect, it } from "vitest"

const ascii = (text: string): number[] => Array.from(text, (char) => char.charCodeAt(0))

const box = (type: string, content: number[]): number[] => {
  const size = 8 + content.length
  return [
    (size >>> 24) & 255,
    (size >>> 16) & 255,
    (size >>> 8) & 255,
    size & 255,
    ...ascii(type),
    ...content,
  ]
}

const toBuffer = (parts: number[][]): ArrayBuffer => new Uint8Array(parts.flat()).buffer

describe("detectMp4VideoCodec", () => {
  it("detects hevc from an hvc1 sample entry in moov", () => {
    const buffer = toBuffer([box("ftyp", ascii("isom")), box("moov", ascii("....hvc1...."))])

    expect(detectMp4VideoCodec(buffer)).toBe("hevc")
  })

  it("detects hevc from an hev1 sample entry", () => {
    const buffer = toBuffer([box("moov", ascii("xxhev1xx"))])

    expect(detectMp4VideoCodec(buffer)).toBe("hevc")
  })

  it("detects h264 from an avc1 sample entry", () => {
    const buffer = toBuffer([box("ftyp", ascii("isom")), box("moov", ascii("--avc1--"))])

    expect(detectMp4VideoCodec(buffer)).toBe("h264")
  })

  it("finds moov even when it sits after a large mdat", () => {
    const mdat = box("mdat", new Array(2000).fill(0x41))
    const buffer = toBuffer([box("ftyp", ascii("isom")), mdat, box("moov", ascii("..avc1.."))])

    expect(detectMp4VideoCodec(buffer)).toBe("h264")
  })

  it("does not mistake avc1 bytes inside mdat for the codec", () => {
    const mdat = box("mdat", ascii("some hvc1 bytes in the media data"))
    const buffer = toBuffer([box("ftyp", ascii("isom")), mdat, box("moov", ascii("..avc1.."))])

    expect(detectMp4VideoCodec(buffer)).toBe("h264")
  })

  it("returns other when moov has no known video codec", () => {
    const buffer = toBuffer([box("moov", ascii("mp4a only"))])

    expect(detectMp4VideoCodec(buffer)).toBe("other")
  })

  it("returns other when there is no moov box", () => {
    const buffer = toBuffer([box("ftyp", ascii("isom")), box("mdat", ascii("hvc1"))])

    expect(detectMp4VideoCodec(buffer)).toBe("other")
  })
})
