const HEIC_EXTENSION_PATTERN = /\.hei[cf]$/i

export const isHeicFile = (file: File): boolean =>
  file.type === "image/heic" ||
  file.type === "image/heif" ||
  HEIC_EXTENSION_PATTERN.test(file.name)

export const convertHeicToJpeg = async (file: File): Promise<File> => {
  const { heicTo } = await import("heic-to/next")
  const blob = await heicTo({ blob: file, type: "image/jpeg", quality: 0.9 })

  return new File([blob], file.name.replace(HEIC_EXTENSION_PATTERN, ".jpg"), {
    type: "image/jpeg",
  })
}
