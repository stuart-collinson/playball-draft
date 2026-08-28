"use client"

import { ForfeitEditForm } from "@pbd/components/Forfeits/ForfeitEditForm"
import { Button } from "@pbd/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@pbd/components/ui/dialog"
import { forfeitDetailOptions } from "@pbd/hooks/forfeits/forfeits.cache"
import { useTRPC } from "@pbd/trpc/react"
import { useQuery } from "@tanstack/react-query"
import { Pencil } from "lucide-react"
import type { JSX } from "react"
import { useState } from "react"

type Props = {
  id: string
}

export const ForfeitEditButton = ({ id }: Props): JSX.Element => {
  const trpc = useTRPC()
  const [open, setOpen] = useState(false)
  const { data: forfeit, error } = useQuery({ ...forfeitDetailOptions(trpc, id), enabled: open })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Edit forfeit"
          className="shrink-0 px-2.5 text-foreground/70 hover:text-foreground"
        >
          <Pencil size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle>Edit the details</DialogTitle>
          <DialogDescription>
            Title and description only. The photo or video stays as it is.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-xs text-red-400">Couldn't load that forfeit.</p>}
        {!error && !forfeit && <p className="text-xs text-muted-foreground">Loading</p>}
        {forfeit && (
          <ForfeitEditForm
            id={id}
            title={forfeit.title}
            description={forfeit.description ?? ""}
            onSaved={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
