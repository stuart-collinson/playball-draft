"use client"

import { ForfeitsUnlockCard } from "@pbd/components/Forfeits/ForfeitsUnlockCard"
import { Button } from "@pbd/components/ui/Button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@pbd/components/ui/dialog"
import type { LeagueScope } from "@pbd/lib/leagues"
import { Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import type { JSX } from "react"
import { useState } from "react"

type Props = {
  scope: LeagueScope
  canUpload: boolean
}

export const ForfeitUploadButton = ({ scope, canUpload }: Props): JSX.Element => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const wizardHref = `/forfeits/${scope}/upload`

  if (canUpload)
    return (
      <Button size="sm" variant="secondary" onClick={() => router.push(wizardHref)}>
        <Upload size={14} />
        Upload
      </Button>
    )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Upload size={14} />
          Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl border-border bg-card">
        <DialogTitle className="sr-only">Upload access</DialogTitle>
        <ForfeitsUnlockCard
          audience="upload"
          framed={false}
          title="Uploaders Only"
          message="Enter the upload password — only two people have this one."
          onUnlocked={() => router.push(wizardHref)}
        />
      </DialogContent>
    </Dialog>
  )
}
