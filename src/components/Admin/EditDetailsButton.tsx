"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { DetailsFields } from "@pbd/components/DetailsFields/DetailsFields"
import { Alert, AlertDescription } from "@pbd/components/ui/alert"
import { Button } from "@pbd/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@pbd/components/ui/dialog"
import type { DetailsFieldsCopy, DetailsValues } from "@pbd/types/form.types"
import { AlertCircle, Pencil } from "lucide-react"
import type { JSX } from "react"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import type { ZodType } from "zod"

type Props = {
  ariaLabel: string
  description: string
  fields: DetailsFieldsCopy
  schema: ZodType<DetailsValues>
  defaultValues: DetailsValues
  fallbackError: string
  isPending: boolean
  onSave: (values: DetailsValues) => Promise<unknown>
}

export const EditDetailsButton = ({
  ariaLabel,
  description,
  fields,
  schema,
  defaultValues,
  fallbackError,
  isPending,
  onSave,
}: Props): JSX.Element => {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<DetailsValues>({ resolver: zodResolver(schema), defaultValues })

  const save = async (values: DetailsValues): Promise<void> => {
    setError(null)

    try {
      await onSave(values)
      setOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : fallbackError)
    }
  }

  const onOpenChange = (nextOpen: boolean): void => {
    setOpen(nextOpen)
    if (nextOpen) {
      setError(null)
      form.reset(defaultValues)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={ariaLabel}
          className="shrink-0 text-foreground/70 hover:text-foreground"
        >
          <Pencil />
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-2xl bg-card sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit the details</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(save)} className="flex flex-col gap-4">
            <DetailsFields {...fields} />

            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" isLoading={isPending}>
                {isPending ? "Saving" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
