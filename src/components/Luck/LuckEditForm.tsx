"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@pbd/components/ui/Button"
import { DialogClose, DialogFooter } from "@pbd/components/ui/dialog"
import { useUpdateLuck } from "@pbd/hooks/luck/useUpdateLuck"
import { LUCK_DESCRIPTION_MAX_LENGTH, LUCK_TITLE_MAX_LENGTH } from "@pbd/lib/constants/Luck"
import { luckDetailsSchema } from "@pbd/lib/luckSchema"
import type { LuckDetailsValues } from "@pbd/lib/luckSchema"
import { cn } from "@pbd/lib/utils/cn"
import type { JSX } from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"

type Props = {
  id: string
  title: string
  description: string
  onSaved: () => void
}

const INPUT_CLASSES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"

export const LuckEditForm = ({ id, title, description, onSaved }: Props): JSX.Element => {
  const updateLuck = useUpdateLuck()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LuckDetailsValues>({
    resolver: zodResolver(luckDetailsSchema),
    defaultValues: { title, description },
  })

  const save = async (values: LuckDetailsValues): Promise<void> => {
    setError(null)

    try {
      await updateLuck.mutateAsync({ id, title: values.title, description: values.description })
      onSaved()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn't save those changes.")
    }
  }

  return (
    <form onSubmit={handleSubmit(save)} className="flex flex-col gap-4">
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
          rows={4}
          maxLength={LUCK_DESCRIPTION_MAX_LENGTH}
          placeholder="What happened, and just how jammy was it?"
          className={INPUT_CLASSES}
        />
        {errors.description && (
          <span className="text-red-400 text-xs">{errors.description.message}</span>
        )}
      </label>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="ghost" size="sm" disabled={updateLuck.isPending}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" size="sm" isLoading={updateLuck.isPending}>
          {updateLuck.isPending ? "Saving" : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  )
}
