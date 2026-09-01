"use client"

import { Button } from "@pbd/components/ui/Button"
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
import { useDeleteLuck } from "@pbd/hooks/luck/useDeleteLuck"
import { Trash2 } from "lucide-react"
import type { JSX } from "react"
import { useState } from "react"

type Props = {
  id: string
  title: string
}

export const LuckDeleteButton = ({ id, title }: Props): JSX.Element => {
  const deleteLuck = useDeleteLuck()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirmDelete = async (): Promise<void> => {
    setError(null)

    try {
      await deleteLuck.mutateAsync({ id })
      setOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn't delete that lucky moment.")
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
          aria-label="Delete lucky moment"
          className="shrink-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <Trash2 size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle>Delete this lucky moment?</DialogTitle>
          <DialogDescription>{title} is removed for good. There's no undo.</DialogDescription>
        </DialogHeader>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" disabled={deleteLuck.isPending}>
              Keep it
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            size="sm"
            onClick={confirmDelete}
            isLoading={deleteLuck.isPending}
          >
            {deleteLuck.isPending ? "Deleting" : "Delete moment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
