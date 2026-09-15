"use client"

import { Button } from "@pbd/components/ui/button"
import { Field, FieldError, FieldLabel } from "@pbd/components/ui/field"
import { Input } from "@pbd/components/ui/input"
import type { GateAudience } from "@pbd/lib/forfeits/gateTokens"
import { resetViewportZoom } from "@pbd/lib/viewportZoom"
import type { FormEvent, JSX } from "react"
import { useId, useState } from "react"

type Status = "idle" | "checking" | "wrong" | "error"

type Props = {
  audience: GateAudience
  placeholder: string
  onUnlocked: () => void
}

const UNLOCK_ROUTE = "/api/forfeits/unlock"

const UNLOCKED_STATUS = 204

const ERROR_TEXT: Partial<Record<Status, string>> = {
  wrong: "That key didn't match. Check it and give it another go.",
  error: "Couldn't check that just now. Try again in a moment.",
}

export const UnlockForm = ({ audience, placeholder, onUnlocked }: Props): JSX.Element => {
  const passwordId = useId()
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<Status>("idle")

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setStatus("checking")

    try {
      const response = await fetch(UNLOCK_ROUTE, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ audience, password }),
      })

      if (response.status === UNLOCKED_STATUS) {
        resetViewportZoom()
        onUnlocked()
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
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field data-invalid={status === "wrong" || undefined}>
        <FieldLabel htmlFor={passwordId} className="sr-only">
          Access key
        </FieldLabel>
        <Input
          id={passwordId}
          type="password"
          value={password}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
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
  )
}
