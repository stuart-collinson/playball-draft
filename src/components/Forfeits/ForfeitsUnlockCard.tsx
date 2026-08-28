"use client"

import { Button } from "@pbd/components/ui/Button"
import { cn } from "@pbd/lib/utils/cn"
import { useRouter } from "next/navigation"
import type { FormEvent, JSX } from "react"
import { useState } from "react"

type Props = {
  audience: "view" | "upload"
  title: string
  message: string
  onUnlocked?: () => void
  framed?: boolean
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
  const [status, setStatus] = useState<"idle" | "checking" | "wrong" | "error">("idle")

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

  return (
    <form
      onSubmit={submit}
      className={cn(
        "flex flex-col items-center gap-3 text-center",
        framed && "rounded-2xl border border-border bg-card p-10",
      )}
    >
      <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{message}</p>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        aria-label="Password"
        autoComplete="off"
        className="h-10 w-full max-w-64 rounded-md border border-border bg-background px-3 text-sm text-foreground"
      />
      {status === "wrong" && <p className="text-xs text-red-400">That's not it. Try again.</p>}
      {status === "error" && (
        <p className="text-xs text-red-400">Couldn't reach the server. Check your connection.</p>
      )}
      <Button
        type="submit"
        size="sm"
        disabled={password.length === 0}
        isLoading={status === "checking"}
      >
        Unlock
      </Button>
    </form>
  )
}
