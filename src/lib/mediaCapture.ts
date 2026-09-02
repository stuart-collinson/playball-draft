import type { ForfeitMediaKind } from "@pbd/lib/constants/Forfeits"
import { getFfmpeg } from "@pbd/lib/ffmpeg"
import { squareCrop } from "@pbd/lib/mediaGeometry"
import { isUniformFrame } from "@pbd/lib/mediaPixels"
import { seconds } from "@pbd/lib/time"

type SquareFrame = {
  blob: Blob
  isUniform: boolean
}

type NativeFrame = {
  thumb: Blob | null
  middleSecond: number
}

const THUMB_SIZE = 400

const THUMB_QUALITY = 0.8

const METADATA_TIMEOUT_MS = seconds(10)

const SEEK_TIMEOUT_MS = seconds(10)

const FRAME_DECODE_SETTLE_MS = 150

const FRAME_INPUT_NAME = "frame-input"

const FRAME_OUTPUT_NAME = "frame.png"

const FRAME_MAX_EDGE = 800

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const canvasToJpeg = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Thumbnail encoding failed"))),
      "image/jpeg",
      THUMB_QUALITY,
    )
  })

const captureSquareFrame = async (
  source: CanvasImageSource,
  width: number,
  height: number,
): Promise<SquareFrame> => {
  const canvas = document.createElement("canvas")
  canvas.width = THUMB_SIZE
  canvas.height = THUMB_SIZE
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Canvas unavailable")

  const { sourceX, sourceY, sourceSize } = squareCrop(width, height)
  context.drawImage(source, sourceX, sourceY, sourceSize, sourceSize, 0, 0, THUMB_SIZE, THUMB_SIZE)
  const isUniform = isUniformFrame(context.getImageData(0, 0, THUMB_SIZE, THUMB_SIZE).data)

  return { blob: await canvasToJpeg(canvas), isUniform }
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

    const frame = await captureSquareFrame(image, image.naturalWidth, image.naturalHeight)
    return frame.blob
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

const waitForVideoEvent = (
  video: HTMLVideoElement,
  event: "loadedmetadata" | "seeked",
  timeoutMs: number,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const listeners = new AbortController()
    const timer = window.setTimeout(() => {
      listeners.abort()
      reject(new Error(`Video ${event} timed out`))
    }, timeoutMs)
    const stop = (): void => {
      window.clearTimeout(timer)
      listeners.abort()
    }

    video.addEventListener(
      event,
      () => {
        stop()
        resolve()
      },
      { signal: listeners.signal },
    )
    video.addEventListener(
      "error",
      () => {
        stop()
        reject(new Error(`Video ${event} failed`))
      },
      { signal: listeners.signal },
    )
  })

const videoMiddleSecond = (video: HTMLVideoElement): number => {
  if (Number.isFinite(video.duration)) return video.duration / 2

  const { seekable } = video
  return seekable.length === 0 ? 0 : seekable.end(seekable.length - 1) / 2
}

const drawSeekedFrame = async (video: HTMLVideoElement, second: number): Promise<Blob | null> => {
  try {
    video.currentTime = second
    await waitForVideoEvent(video, "seeked", SEEK_TIMEOUT_MS)
    await delay(FRAME_DECODE_SETTLE_MS)

    const frame = await captureSquareFrame(video, video.videoWidth, video.videoHeight)
    return frame.isUniform ? null : frame.blob
  } catch {
    return null
  }
}

const captureNativeVideoFrame = async (file: File): Promise<NativeFrame> => {
  const objectUrl = URL.createObjectURL(file)
  const video = document.createElement("video")
  video.muted = true
  video.playsInline = true
  video.preload = "metadata"

  try {
    video.src = objectUrl
    await waitForVideoEvent(video, "loadedmetadata", METADATA_TIMEOUT_MS)

    const middleSecond = videoMiddleSecond(video)
    return { thumb: await drawSeekedFrame(video, middleSecond), middleSecond }
  } finally {
    video.removeAttribute("src")
    video.load()
    URL.revokeObjectURL(objectUrl)
  }
}

const frameExtractionArgs = (second: number): string[] => [
  "-ss",
  second.toFixed(3),
  "-i",
  FRAME_INPUT_NAME,
  "-frames:v",
  "1",
  "-vf",
  `scale=w=${FRAME_MAX_EDGE}:h=${FRAME_MAX_EDGE}:force_original_aspect_ratio=decrease`,
  FRAME_OUTPUT_NAME,
]

const captureDecodedVideoFrame = async (file: File, second: number): Promise<Blob> => {
  const ffmpeg = await getFfmpeg()
  const { fetchFile } = await import("@ffmpeg/util")

  try {
    await ffmpeg.writeFile(FRAME_INPUT_NAME, await fetchFile(file))
    await ffmpeg.exec(frameExtractionArgs(second))
    const output = await ffmpeg.readFile(FRAME_OUTPUT_NAME)
    if (typeof output === "string") throw new Error("Unexpected text output from frame extraction")

    const bitmap = await createImageBitmap(new Blob([output.slice()], { type: "image/png" }))
    try {
      const frame = await captureSquareFrame(bitmap, bitmap.width, bitmap.height)
      return frame.blob
    } finally {
      bitmap.close()
    }
  } finally {
    await ffmpeg.deleteFile(FRAME_INPUT_NAME).catch(() => undefined)
    await ffmpeg.deleteFile(FRAME_OUTPUT_NAME).catch(() => undefined)
  }
}

const captureFromVideo = async (file: File, onDecodeFallback: () => void): Promise<Blob> => {
  const { thumb, middleSecond } = await captureNativeVideoFrame(file)
  if (thumb) return thumb

  onDecodeFallback()
  return captureDecodedVideoFrame(file, middleSecond)
}

export const captureThumbnail = (
  file: File,
  kind: ForfeitMediaKind,
  onDecodeFallback: () => void,
): Promise<Blob> =>
  kind === "video" ? captureFromVideo(file, onDecodeFallback) : captureFromImage(file)
