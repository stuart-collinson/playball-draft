const IMAGE_FORMAT = { mime: "image/png", extension: "png" } as const

const IMAGE_SCALE = 2

export type ShareOutcome = "shared" | "dismissed" | "copied"

type ShareScreenInput = {
  target: HTMLElement | null
  title: string
  text: string
}

const isDismissal = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError"

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const captureImage = async (target: HTMLElement, title: string): Promise<File | null> => {
  try {
    const { domToBlob } = await import("modern-screenshot")
    await document.fonts.ready
    const blob = await domToBlob(target, { type: IMAGE_FORMAT.mime, scale: IMAGE_SCALE })

    return new File([blob], `${slugify(title)}.${IMAGE_FORMAT.extension}`, {
      type: IMAGE_FORMAT.mime,
    })
  } catch (error) {
    console.error("[home][share] screenshot failed:", error)
    return null
  }
}

const copyLink = async (text: string): Promise<ShareOutcome> => {
  await navigator.clipboard.writeText(`${text} ${window.location.href}`)
  return "copied"
}

const canShareImage = (image: File): boolean =>
  typeof navigator.canShare === "function" && navigator.canShare({ files: [image] })

const shareImage = async (image: File, title: string, text: string): Promise<ShareOutcome> => {
  try {
    await navigator.share({ files: [image], title, text })
    return "shared"
  } catch (error) {
    if (isDismissal(error)) return "dismissed"
    console.error("[home][share] image share failed:", error)
    return copyLink(text)
  }
}

const shareLink = async (title: string, text: string): Promise<ShareOutcome> => {
  if (typeof navigator.share !== "function") return copyLink(text)

  try {
    await navigator.share({ title, text, url: window.location.href })
    return "shared"
  } catch (error) {
    if (isDismissal(error)) return "dismissed"
    return copyLink(text)
  }
}

export const shareScreen = async ({
  target,
  title,
  text,
}: ShareScreenInput): Promise<ShareOutcome> => {
  const image = target ? await captureImage(target, title) : null
  if (image && canShareImage(image)) return shareImage(image, title, text)

  return shareLink(title, text)
}
