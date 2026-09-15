"use client"

import { Button } from "@pbd/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@pbd/components/ui/card"
import { Field, FieldError, FieldLabel } from "@pbd/components/ui/field"
import { Input } from "@pbd/components/ui/input"
import type { GateAudience } from "@pbd/lib/forfeits/gateTokens"
import { resetViewportZoom } from "@pbd/lib/viewportZoom"
import { LockKeyhole } from "lucide-react"
import { useRouter } from "next/navigation"
import type { FormEvent, JSX } from "react"
import { useId, useState } from "react"

type Status = "idle" | "checking" | "wrong" | "error"

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
    message: "Enter the league password to open the forfeit archive.",
  },
  upload: {
    title: "Admins Only",
    message: "Enter the admin password. Not everyone in the chat will have access to this.",
  },
}

const ERROR_TEXT: Partial<Record<Status, string>> = {
  wrong: "That's not it. Give it another go.",
  error: "Couldn't reach the server. Check your connection.",
}

export const UnlockCard = ({ audience }: Props): JSX.Element => {
  const { title, message } = UNLOCK_COPY[audience]
  const router = useRouter()
  const passwordId = useId()
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<Status>("idle")

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setStatus("checking")

    try {
      const response = await fetch("/api/forfeits/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ audience, password }),
      })

      if (response.status === 204) {
        resetViewportZoom()
        router.refresh()
        return
      }

      setStatus("wrong")
    } catch {
      setStatus("error")
    }
  }

  const onChange = (value: string): void => {
    setPassword(value)
    if (status === "wrong" || status === "error") setStatus("idle")
  }

  const errorText = ERROR_TEXT[status] ?? null

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
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field data-invalid={status === "wrong" || undefined}>
            <FieldLabel htmlFor={passwordId} className="sr-only">
              Password
            </FieldLabel>
            <Input
              id={passwordId}
              type="password"
              value={password}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Enter password"
              aria-invalid={status === "wrong" || undefined}
              autoComplete="off"
              className="h-12 text-center"
            />
            {errorText && <FieldError className="text-center">{errorText}</FieldError>}
          </Field>

          <Button
            type="submit"
            className="w-full"
            disabled={password.length === 0}
            isLoading={status === "checking"}
          >
            Unlock
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
