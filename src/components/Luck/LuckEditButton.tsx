"use client"

import { LuckEditForm } from "@pbd/components/Luck/LuckEditForm"
import { Button } from "@pbd/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@pbd/components/ui/dialog"
import { Pencil } from "lucide-react"
import type { JSX } from "react"
import { useState } from "react"

type Props = {
  id: string
  title: string
  description: string
}

export const LuckEditButton = ({ id, title, description }: Props): JSX.Element => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Edit lucky moment"
          className="shrink-0 px-2.5 text-foreground/70 hover:text-foreground"
        >
          <Pencil size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle>Edit the details</DialogTitle>
          <DialogDescription>
            Title and story only. Delete and re-add if the week or person is wrong.
          </DialogDescription>
        </DialogHeader>
        <LuckEditForm
          id={id}
          title={title}
          description={description}
          onSaved={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
