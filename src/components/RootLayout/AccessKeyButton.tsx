"use client"

import { UnlockForm } from "@pbd/components/UnlockCard/UnlockForm"
import { Button } from "@pbd/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@pbd/components/ui/dialog"
import { cn } from "@pbd/lib/className"
import { EXTRA_HREF } from "@pbd/lib/constants/Pages"
import { KeyRound } from "lucide-react"
import type { JSX } from "react"
import { useState } from "react"

type Props = {
  className?: string
}

export const AccessKeyButton = ({ className }: Props): JSX.Element => {
  const [open, setOpen] = useState(false)

  const onUnlocked = (): void => {
    setOpen(false)
    window.location.assign(EXTRA_HREF)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Enter your access key"
          className={cn("text-muted-foreground hover:text-foreground", className)}
        >
          <KeyRound />
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-2xl bg-card sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Enter your access key</DialogTitle>
          <DialogDescription>
            The league key opens the forfeit archive. The admin key opens that and the admin area
            too.
          </DialogDescription>
        </DialogHeader>
        <UnlockForm audience="view" placeholder="Access key" onUnlocked={onUnlocked} />
      </DialogContent>
    </Dialog>
  )
}
