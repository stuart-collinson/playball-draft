import { cn } from "@pbd/lib/className"
import type { DetailsFieldsCopy, DetailsValues } from "@pbd/types/form.types"
import type { JSX } from "react"
import { useFormContext } from "react-hook-form"

const INPUT_CLASSES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"

export const DetailsFields = ({
  titlePlaceholder,
  titleMaxLength,
  descriptionLabel,
  descriptionHint,
  descriptionPlaceholder,
  descriptionMaxLength,
  descriptionRows,
}: DetailsFieldsCopy): JSX.Element => {
  const {
    register,
    formState: { errors },
  } = useFormContext<DetailsValues>()

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Title</span>
        <input
          {...register("title")}
          maxLength={titleMaxLength}
          placeholder={titlePlaceholder}
          className={cn(INPUT_CLASSES, "h-10")}
        />
        {errors.title && <span className="text-xs text-red-400">{errors.title.message}</span>}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">
          {descriptionLabel}
          {descriptionHint && (
            <span className="font-normal text-muted-foreground"> ({descriptionHint})</span>
          )}
        </span>
        <textarea
          {...register("description")}
          rows={descriptionRows}
          maxLength={descriptionMaxLength}
          placeholder={descriptionPlaceholder}
          className={INPUT_CLASSES}
        />
        {errors.description && (
          <span className="text-xs text-red-400">{errors.description.message}</span>
        )}
      </label>
    </div>
  )
}
