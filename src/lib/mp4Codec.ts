export type VideoCodec = "hevc" | "h264" | "other"

const fourcc = (code: string): number =>
  ((code.charCodeAt(0) << 24) |
    (code.charCodeAt(1) << 16) |
    (code.charCodeAt(2) << 8) |
    code.charCodeAt(3)) >>>
  0

const MOOV = fourcc("moov")
const HVC1 = fourcc("hvc1")
const HEV1 = fourcc("hev1")
const AVC1 = fourcc("avc1")
const AVC3 = fourcc("avc3")

const rangeContains = (view: DataView, start: number, end: number, needle: number): boolean => {
  for (let offset = start; offset + 4 <= end; offset += 1) {
    if (view.getUint32(offset) === needle) return true
  }
  return false
}

export const detectMp4VideoCodec = (buffer: ArrayBuffer): VideoCodec => {
  const view = new DataView(buffer)
  const length = buffer.byteLength
  let offset = 0

  while (offset + 8 <= length) {
    let size = view.getUint32(offset)
    const type = view.getUint32(offset + 4)
    let headerSize = 8

    if (size === 1) {
      if (offset + 16 > length) break
      size = Number(view.getBigUint64(offset + 8))
      headerSize = 16
    } else if (size === 0) {
      size = length - offset
    }
    if (size < headerSize) break

    if (type === MOOV) {
      const start = offset + headerSize
      const end = Math.min(offset + size, length)
      if (rangeContains(view, start, end, HVC1) || rangeContains(view, start, end, HEV1))
        return "hevc"
      if (rangeContains(view, start, end, AVC1) || rangeContains(view, start, end, AVC3))
        return "h264"
      return "other"
    }

    offset += size
  }

  return "other"
}
