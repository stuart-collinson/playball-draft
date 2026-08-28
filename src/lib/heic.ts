const HEIC_EXTENSION_PATTERN = /\.hei[cf]$/i

export const isHeicFile = (file: File): boolean =>
  file.type === "image/heic" || file.type === "image/heif" || HEIC_EXTENSION_PATTERN.test(file.name)

export const convertHeicToJpeg = async (file: File): Promise<File> => {
  const { default: heic2any } = await import("heic2any")
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 })
  const blob = Array.isArray(result) ? result[0] : result
  if (!blob) throw new Error("HEIC conversion produced no image")

  return new File([blob], file.name.replace(HEIC_EXTENSION_PATTERN, ".jpg"), {
    type: "image/jpeg",
  })
}
