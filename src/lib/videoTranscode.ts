import { getFfmpeg } from "@pbd/lib/ffmpeg"

const INPUT_NAME = "input"

const OUTPUT_NAME = "output.mp4"

const TRANSCODE_ARGS = [
  "-i",
  INPUT_NAME,
  "-c:v",
  "libx264",
  "-preset",
  "ultrafast",
  "-crf",
  "26",
  "-vf",
  "scale=w=1280:h=1280:force_original_aspect_ratio=decrease:force_divisible_by=2",
  "-c:a",
  "aac",
  "-b:a",
  "128k",
  "-movflags",
  "+faststart",
  OUTPUT_NAME,
]

export const transcodeToH264 = async (
  file: File,
  onProgress: (ratio: number) => void,
): Promise<File> => {
  const ffmpeg = await getFfmpeg()
  const { fetchFile } = await import("@ffmpeg/util")

  const onFfmpegProgress = ({ progress }: { progress: number }): void => {
    onProgress(Math.min(Math.max(progress, 0), 1))
  }
  ffmpeg.on("progress", onFfmpegProgress)

  try {
    await ffmpeg.writeFile(INPUT_NAME, await fetchFile(file))
    await ffmpeg.exec(TRANSCODE_ARGS)
    const output = await ffmpeg.readFile(OUTPUT_NAME)
    if (typeof output === "string") throw new Error("Unexpected text output from transcode")

    const outputCopy = output.slice()
    const name = file.name.replace(/\.[^.]+$/, ".mp4")
    return new File([outputCopy], name, { type: "video/mp4" })
  } finally {
    ffmpeg.off("progress", onFfmpegProgress)
    await ffmpeg.deleteFile(INPUT_NAME).catch(() => undefined)
    await ffmpeg.deleteFile(OUTPUT_NAME).catch(() => undefined)
  }
}
