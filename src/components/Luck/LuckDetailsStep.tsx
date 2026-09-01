import { LUCK_DESCRIPTION_MAX_LENGTH, LUCK_TITLE_MAX_LENGTH } from "@pbd/lib/constants/Luck"
import type { CreateLuckInput } from "@pbd/lib/luckSchema"
import { cn } from "@pbd/lib/utils/cn"
import type { JSX } from "react"
import { useFormContext } from "react-hook-form"

const INPUT_CLASSES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"

export const LuckDetailsStep = (): JSX.Element => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateLuckInput>()

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Title</span>
        <input
          {...register("title")}
          maxLength={LUCK_TITLE_MAX_LENGTH}
          placeholder="The eye-grabbing headline"
          className={cn(INPUT_CLASSES, "h-10")}
        />
        {errors.title && <span className="text-red-400 text-xs">{errors.title.message}</span>}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">The story</span>
        <textarea
          {...register("description")}
          rows={5}
          maxLength={LUCK_DESCRIPTION_MAX_LENGTH}
          placeholder="What happened, and just how jammy was it?"
          className={INPUT_CLASSES}
        />
        {errors.description && (
          <span className="text-red-400 text-xs">{errors.description.message}</span>
        )}
      </label>
    </div>
  )
}
