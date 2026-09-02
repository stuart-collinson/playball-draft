const RGBA_STRIDE = 4

export const isUniformFrame = (pixels: Uint8ClampedArray): boolean => {
  const red = pixels[0]
  const green = pixels[1]
  const blue = pixels[2]

  for (let offset = RGBA_STRIDE; offset + RGBA_STRIDE <= pixels.length; offset += RGBA_STRIDE) {
    if (pixels[offset] !== red || pixels[offset + 1] !== green || pixels[offset + 2] !== blue)
      return false
  }

  return true
}
