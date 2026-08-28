"use client"

import { Button } from "@pbd/components/ui/Button"
import { cn } from "@pbd/lib/utils/cn"
import { LockKeyhole } from "lucide-react"
import { useRouter } from "next/navigation"
import type { FormEvent, JSX } from "react"
import { useState } from "react"

type Status = "idle" | "checking" | "wrong" | "error"

type Props = {
  audience: "view" | "upload"
  title: string
  message: string
  onUnlocked?: () => void
  framed?: boolean
}

const ERROR_TEXT: Partial<Record<Status, string>> = {
  wrong: "That's not it. Give it another go.",
  error: "Couldn't reach the server. Check your connection.",
}

export const ForfeitsUnlockCard = ({
  audience,
  title,
  message,
  onUnlocked,
  framed = true,
}: Props): JSX.Element => {
  const router = useRouter()
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
        if (onUnlocked) onUnlocked()
        else router.refresh()
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
    <form
      onSubmit={submit}
      className={cn(
        "mx-auto flex w-full max-w-sm flex-col items-center gap-5 text-center",
        framed && "rounded-3xl border border-border bg-card p-8 shadow-xl shadow-black/25",
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
        <LockKeyhole size={26} strokeWidth={2} />
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="font-bold text-foreground text-lg">{title}</h2>
        <p className="text-balance text-muted-foreground text-sm">{message}</p>
      </div>

      <div className="flex w-full flex-col gap-2">
        <input
          type="password"
          value={password}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter password"
          aria-label="Password"
          aria-invalid={status === "wrong"}
          autoComplete="off"
          className={cn(
            "h-12 w-full rounded-xl border bg-background px-4 text-center text-foreground text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            status === "wrong" ? "border-red-500/60" : "border-border focus-visible:border-primary",
          )}
        />
        {errorText && <p className="text-red-400 text-xs">{errorText}</p>}
      </div>

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
