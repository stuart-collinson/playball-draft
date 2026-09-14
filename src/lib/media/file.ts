import { FORFEIT_MEDIA_MIME_EXTENSIONS } from "@pbd/lib/constants/Forfeits"
import type { ForfeitMediaKind } from "@pbd/lib/constants/Forfeits"

const EXTENSION_TO_MIME: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
}

const ALLOWED_MIMES = new Set(Object.keys(FORFEIT_MEDIA_MIME_EXTENSIONS))

const extensionOf = (fileName: string): string => {
  const dot = fileName.lastIndexOf(".")
  return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase()
}

export type ResolvedMedia = {
  mime: string
  kind: ForfeitMediaKind
}

export const resolveMediaType = (fileName: string, fileType: string): ResolvedMedia | null => {
  const mime = ALLOWED_MIMES.has(fileType) ? fileType : EXTENSION_TO_MIME[extensionOf(fileName)]
  if (!mime) return null

  return { mime, kind: mime.startsWith("video/") ? "video" : "photo" }
}
