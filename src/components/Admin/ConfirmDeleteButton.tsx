"use client"

import { Alert, AlertDescription } from "@pbd/components/ui/alert"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@pbd/components/ui/alert-dialog"
import { Button } from "@pbd/components/ui/button"
import { AlertCircle, Trash2 } from "lucide-react"
import type { JSX } from "react"
import { useState } from "react"

type Props = {
  ariaLabel: string
  heading: string
  description: string
  confirmLabel: string
  pendingLabel: string
  fallbackError: string
  isPending: boolean
  onDelete: () => Promise<unknown>
}

export const ConfirmDeleteButton = ({
  ariaLabel,
  heading,
  description,
  confirmLabel,
  pendingLabel,
  fallbackError,
  isPending,
  onDelete,
}: Props): JSX.Element => {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirmDelete = async (): Promise<void> => {
    setError(null)

    try {
      await onDelete()
      setOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : fallbackError)
    }
  }

  const onOpenChange = (nextOpen: boolean): void => {
    setOpen(nextOpen)
    if (nextOpen) setError(null)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={ariaLabel}
          className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent size="sm" className="rounded-2xl bg-card">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>{heading}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep it</AlertDialogCancel>
          <Button variant="destructive" onClick={confirmDelete} isLoading={isPending}>
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
