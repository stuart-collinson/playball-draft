"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@pbd/components/ui/Button"
import { DialogClose, DialogFooter } from "@pbd/components/ui/dialog"
import { useUpdateForfeit } from "@pbd/hooks/forfeits/useUpdateForfeit"
import {
  FORFEIT_DESCRIPTION_MAX_LENGTH,
  FORFEIT_TITLE_MAX_LENGTH,
} from "@pbd/lib/constants/Forfeits"
import { forfeitDetailsSchema } from "@pbd/lib/forfeitsSchema"
import type { ForfeitDetailsValues } from "@pbd/lib/forfeitsSchema"
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

export const ForfeitEditForm = ({ id, title, description, onSaved }: Props): JSX.Element => {
  const updateForfeit = useUpdateForfeit()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForfeitDetailsValues>({
    resolver: zodResolver(forfeitDetailsSchema),
    defaultValues: { title, description },
  })

  const save = async (values: ForfeitDetailsValues): Promise<void> => {
    setError(null)

    try {
      await updateForfeit.mutateAsync({ id, title: values.title, description: values.description })
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

      {error && <p className="text-xs text-red-400">{error}</p>}

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="ghost" size="sm" disabled={updateForfeit.isPending}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" size="sm" isLoading={updateForfeit.isPending}>
          {updateForfeit.isPending ? "Saving" : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  )
}
