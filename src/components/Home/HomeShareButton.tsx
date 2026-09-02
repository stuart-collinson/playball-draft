"use client"

import { HOME_SHARE_COPIED_MS } from "@pbd/lib/constants/Home"
import { cn } from "@pbd/lib/utils/cn"
import { Check, Send } from "lucide-react"
import type { JSX } from "react"
import { useEffect, useState } from "react"

type Props = {
  title: string
  text: string
  label: string
  className: string
  iconClassName?: string
}

export const HomeShareButton = ({
  title,
  text,
  label,
  className,
  iconClassName,
}: Props): JSX.Element => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), HOME_SHARE_COPIED_MS)
    return () => clearTimeout(timer)
  }, [copied])

  const share = async (): Promise<void> => {
    const url = window.location.href
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url })
      } catch {
        return
      }
      return
    }
    await navigator.clipboard.writeText(`${text} ${url}`)
    setCopied(true)
  }

  const Icon = copied ? Check : Send

  return (
    <button
      type="button"
      onClick={share}
      className={cn(
        "flex w-full items-center justify-center gap-2.5 text-xs font-black uppercase tracking-wider transition-transform active:scale-[0.99]",
        className,
      )}
    >
      <Icon size={18} className={iconClassName} />
      {copied ? "Copied to clipboard" : label}
    </button>
  )
}
