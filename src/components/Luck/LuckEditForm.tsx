"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LuckDetailsFields } from "@pbd/components/Luck/LuckDetailsFields"
import { Button } from "@pbd/components/ui/Button"
import { DialogClose, DialogFooter } from "@pbd/components/ui/dialog"
import { useUpdateLuck } from "@pbd/hooks/luck/useUpdateLuck"
import { luckDetailsSchema } from "@pbd/lib/luckSchema"
import type { LuckDetailsValues } from "@pbd/lib/luckSchema"
import type { JSX } from "react"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

type Props = {
  id: string
  title: string
  description: string
  onSaved: () => void
}

export const LuckEditForm = ({ id, title, description, onSaved }: Props): JSX.Element => {
  const updateLuck = useUpdateLuck()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LuckDetailsValues>({
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
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(save)} className="flex flex-col gap-4">
        <LuckDetailsFields />

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
    </FormProvider>
  )
}
