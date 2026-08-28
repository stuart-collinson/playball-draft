import type { ForfeitMediaKind } from "@pbd/lib/constants/Forfeits"
import { squareCrop } from "@pbd/lib/mediaGeometry"

const THUMB_SIZE = 400

const THUMB_QUALITY = 0.8

const canvasToJpeg = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Thumbnail encoding failed"))),
      "image/jpeg",
      THUMB_QUALITY,
    )
  })

const drawSquareThumb = (
  source: CanvasImageSource,
  width: number,
  height: number,
): Promise<Blob> => {
  const canvas = document.createElement("canvas")
  canvas.width = THUMB_SIZE
  canvas.height = THUMB_SIZE
  const context = canvas.getContext("2d")
  if (!context) return Promise.reject(new Error("Canvas unavailable"))

  const { sourceX, sourceY, sourceSize } = squareCrop(width, height)
  context.drawImage(source, sourceX, sourceY, sourceSize, sourceSize, 0, 0, THUMB_SIZE, THUMB_SIZE)

  return canvasToJpeg(canvas)
}

const captureFromImage = async (file: File): Promise<Blob> => {
  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error("Image failed to load"))
      element.src = objectUrl
    })

    return await drawSquareThumb(image, image.naturalWidth, image.naturalHeight)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

const captureFromVideoMiddleFrame = async (file: File): Promise<Blob> => {
  const objectUrl = URL.createObjectURL(file)
  const video = document.createElement("video")
  video.muted = true
  video.playsInline = true
  video.preload = "auto"

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve()
      video.onerror = () => reject(new Error("Video failed to load"))
      video.src = objectUrl
    })

    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve()
      video.onerror = () => reject(new Error("Video seek failed"))
      video.currentTime = Number.isFinite(video.duration) ? video.duration / 2 : 0
    })

    return await drawSquareThumb(video, video.videoWidth, video.videoHeight)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

const placeholderThumb = (): Promise<Blob> => {
  const canvas = document.createElement("canvas")
  canvas.width = THUMB_SIZE
  canvas.height = THUMB_SIZE
  const context = canvas.getContext("2d")
  if (context) {
    context.fillStyle = "#27272a"
    context.fillRect(0, 0, THUMB_SIZE, THUMB_SIZE)
  }

  return canvasToJpeg(canvas)
}

export const captureThumbnail = async (file: File, kind: ForfeitMediaKind): Promise<Blob> => {
  try {
    return kind === "video" ? await captureFromVideoMiddleFrame(file) : await captureFromImage(file)
  } catch {
    return placeholderThumb()
  }
}
