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
import { useDeleteForfeit } from "@pbd/hooks/forfeits/useDeleteForfeit"
import { Trash2 } from "lucide-react"
import type { JSX } from "react"
import { useState } from "react"

type Props = {
  id: string
  title: string
}

export const ForfeitDeleteButton = ({ id, title }: Props): JSX.Element => {
  const deleteForfeit = useDeleteForfeit()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirmDelete = async (): Promise<void> => {
    setError(null)

    try {
      await deleteForfeit.mutateAsync({ id })
      setOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn't delete that forfeit.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Delete forfeit"
          className="shrink-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <Trash2 size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle>Delete this forfeit?</DialogTitle>
          <DialogDescription>
            {title} and its photo or video are removed for good. There's no undo.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" disabled={deleteForfeit.isPending}>
              Keep it
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            size="sm"
            onClick={confirmDelete}
            isLoading={deleteForfeit.isPending}
          >
            {deleteForfeit.isPending ? "Deleting" : "Delete forfeit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
