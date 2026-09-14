"use client"

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
import { Trash2 } from "lucide-react"
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={ariaLabel}
          className="shrink-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <Trash2 size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle>{heading}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" disabled={isPending}>
              Keep it
            </Button>
          </DialogClose>
          <Button variant="destructive" size="sm" onClick={confirmDelete} isLoading={isPending}>
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
