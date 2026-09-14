import type { FFmpeg } from "@ffmpeg/ffmpeg"

const CORE_BASE_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd"

let ffmpegPromise: Promise<FFmpeg> | null = null

const loadFfmpeg = async (): Promise<FFmpeg> => {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg")
  const { toBlobURL } = await import("@ffmpeg/util")
  const ffmpeg = new FFmpeg()

  await ffmpeg.load({
    coreURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
  })

  return ffmpeg
}

export const getFfmpeg = (): Promise<FFmpeg> => {
  if (!ffmpegPromise) ffmpegPromise = loadFfmpeg()
  return ffmpegPromise
}
