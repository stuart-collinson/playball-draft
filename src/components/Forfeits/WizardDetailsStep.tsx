import {
  FORFEIT_DESCRIPTION_MAX_LENGTH,
  FORFEIT_MEDIA_MIME_EXTENSIONS,
  FORFEIT_TITLE_MAX_LENGTH,
} from "@pbd/lib/constants/Forfeits"
import type { ForfeitWizardValues } from "@pbd/lib/forfeitsSchema"
import { cn } from "@pbd/lib/utils/cn"
import { ImagePlus } from "lucide-react"
import type { ChangeEvent, JSX } from "react"
import { useFormContext } from "react-hook-form"

type Props = {
  previewUrl: string | null
  fileName: string | null
  mediaError: string | null
  onPickFile: (file: File) => void
}

const ACCEPTED_MEDIA_TYPES = Object.keys(FORFEIT_MEDIA_MIME_EXTENSIONS).join(",")

const INPUT_CLASSES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"

export const WizardDetailsStep = ({
  previewUrl,
  fileName,
  mediaError,
  onPickFile,
}: Props): JSX.Element => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ForfeitWizardValues>()

  const handleFile = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file) onPickFile(file)
    event.target.value = ""
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Title</span>
        <input
          {...register("title")}
          maxLength={FORFEIT_TITLE_MAX_LENGTH}
          placeholder="The eye-grabbing tagline"
          className={cn(INPUT_CLASSES, "h-10")}
        />
        {errors.title && <span className="text-xs text-red-400">{errors.title.message}</span>}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">
          Description <span className="font-normal text-muted-foreground">(optional)</span>
        </span>
        <textarea
          {...register("description")}
          rows={4}
          maxLength={FORFEIT_DESCRIPTION_MAX_LENGTH}
          placeholder="As much detail as it deserves"
          className={INPUT_CLASSES}
        />
        {errors.description && (
          <span className="text-xs text-red-400">{errors.description.message}</span>
        )}
      </label>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-border border-dashed bg-background p-6 text-center">
        <input type="file" accept={ACCEPTED_MEDIA_TYPES} onChange={handleFile} className="hidden" />
        {previewUrl ? (
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
              MP4, MOV, JPG, PNG or WebP, up to 25MB. Upload the copy WhatsApp saved.
            </span>
          </>
        )}
      </label>

      {mediaError && <p className="text-xs text-red-400">{mediaError}</p>}
    </div>
  )
}
