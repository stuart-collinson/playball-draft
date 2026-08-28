export type SquareCrop = {
  sourceX: number
  sourceY: number
  sourceSize: number
}

export const squareCrop = (width: number, height: number): SquareCrop => {
  const sourceSize = Math.min(width, height)

  return {
    sourceX: Math.floor((width - sourceSize) / 2),
    sourceY: Math.floor((height - sourceSize) / 2),
    sourceSize,
  }
}
