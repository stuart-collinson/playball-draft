"use client"

import { UnlockForm } from "@pbd/components/UnlockCard/UnlockForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@pbd/components/ui/card"
import type { GateAudience } from "@pbd/lib/forfeits/gateTokens"
import { LockKeyhole } from "lucide-react"
import { useRouter } from "next/navigation"
import type { JSX } from "react"

type Props = {
  audience: GateAudience
}

type UnlockCopy = {
  title: string
  message: string
}

const UNLOCK_COPY: Record<GateAudience, UnlockCopy> = {
  view: {
    title: "Members Only",
    message: "Enter the league key to open the forfeit archive.",
  },
  upload: {
    title: "Admins Only",
    message: "Enter the admin key. Not everyone in the chat will have access to this.",
  },
}

export const UnlockCard = ({ audience }: Props): JSX.Element => {
  const { title, message } = UNLOCK_COPY[audience]
  const router = useRouter()

  return (
    <Card className="mx-auto w-full max-w-sm gap-5 rounded-3xl py-8 shadow-xl shadow-black/25">
      <CardHeader className="justify-items-center gap-3 px-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
          <LockKeyhole size={26} strokeWidth={2} />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-balance">{message}</CardDescription>
      </CardHeader>

      <CardContent className="px-8">
        <UnlockForm
          audience={audience}
          placeholder="Enter key"
          onUnlocked={() => router.refresh()}
        />
      </CardContent>
    </Card>
  )
}
