import { DetailsFields } from "@pbd/components/DetailsFields/DetailsFields"
import { FORFEIT_DETAILS_FIELDS, FORFEIT_UPLOAD_ACCEPT } from "@pbd/lib/constants/Forfeits"
import { ImagePlus, Loader2 } from "lucide-react"
import type { ChangeEvent, JSX } from "react"

type Props = {
  previewUrl: string | null
  fileName: string | null
  mediaError: string | null
  isProcessing: boolean
  processingMessage: string
  onPickFile: (file: File) => void
}

export const ForfeitDetailsStep = ({
  previewUrl,
  fileName,
  mediaError,
  isProcessing,
  processingMessage,
  onPickFile,
}: Props): JSX.Element => {
  const handleFile = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file) onPickFile(file)
    event.target.value = ""
  }

  return (
    <div className="flex flex-col gap-4">
      <DetailsFields {...FORFEIT_DETAILS_FIELDS} />

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-border border-dashed bg-background p-6 text-center focus-within:ring-2 focus-within:ring-ring">
        <input
          type="file"
          accept={FORFEIT_UPLOAD_ACCEPT}
          onChange={handleFile}
          className="sr-only"
        />
        {isProcessing ? (
          <>
            <Loader2 size={22} className="animate-spin text-primary" />
            <span className="text-sm font-medium text-foreground">{processingMessage}</span>
            <span className="text-xs text-muted-foreground">
              Hang tight, this can take a moment for videos.
            </span>
          </>
        ) : previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Thumbnail preview"
              className="h-28 w-28 rounded-xl border border-border object-cover"
            />
            <span className="max-w-full truncate text-xs text-muted-foreground">{fileName}</span>
            <span className="text-xs text-muted-foreground">Tap to swap it</span>
          </>
        ) : (
          <>
            <ImagePlus size={22} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Add the photo or video</span>
            <span className="text-xs text-muted-foreground">
              Photos and videos up to 25MB, iPhone snaps included. Upload the copy WhatsApp saved.
            </span>
          </>
        )}
      </label>

      {mediaError && <p className="text-xs text-red-400">{mediaError}</p>}
    </div>
  )
}
