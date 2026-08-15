export const WHEEL_VIEWBOX = "0 0 400 400"
export const WHEEL_CENTRE = 200
export const RIM_RADIUS = 186

const DISC_RADIUS = 172
const COORDINATE_PRECISION = 1000
const SINGLE_LINE_MAX_LENGTH = 12

type Point = {
  x: number
  y: number
}

const toFixedPrecision = (value: number): number =>
  Math.round(value * COORDINATE_PRECISION) / COORDINATE_PRECISION

export const polar = (radius: number, degrees: number): Point => {
  const radians = (degrees * Math.PI) / 180

  return {
    x: toFixedPrecision(WHEEL_CENTRE + radius * Math.sin(radians)),
    y: toFixedPrecision(WHEEL_CENTRE - radius * Math.cos(radians)),
  }
}

export const segmentAngle = (segmentCount: number): number => 360 / segmentCount

export const segmentBoundaryAngle = (index: number, segmentCount: number): number =>
  index * segmentAngle(segmentCount)

export const segmentBisectorAngle = (index: number, segmentCount: number): number =>
  segmentBoundaryAngle(index, segmentCount) + segmentAngle(segmentCount) / 2

export const segmentPath = (index: number, segmentCount: number): string => {
  const start = polar(DISC_RADIUS, segmentBoundaryAngle(index, segmentCount))
  const end = polar(DISC_RADIUS, segmentBoundaryAngle(index + 1, segmentCount))

  return [
    `M ${WHEEL_CENTRE} ${WHEEL_CENTRE}`,
    `L ${start.x} ${start.y}`,
    `A ${DISC_RADIUS} ${DISC_RADIUS} 0 0 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ")
}

export const splitLabelLines = (label: string): string[] => {
  if (label.length <= SINGLE_LINE_MAX_LENGTH) return [label]

  const words = label.split(" ")
  if (words.length < 2) return [label]

  let bestLines = [label]
  let bestLongestLength = Number.POSITIVE_INFINITY

  for (let splitAt = 1; splitAt < words.length; splitAt++) {
    const firstLine = words.slice(0, splitAt).join(" ")
    const secondLine = words.slice(splitAt).join(" ")
    const longestLength = Math.max(firstLine.length, secondLine.length)

    if (longestLength < bestLongestLength) {
      bestLongestLength = longestLength
      bestLines = [firstLine, secondLine]
    }
  }

  return bestLines
}
