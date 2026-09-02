"use client"

import { HOME_SHARE_COPIED_MS } from "@pbd/lib/constants/Home"
import { shareScreen } from "@pbd/lib/shareScreen"
import { cn } from "@pbd/lib/utils/cn"
import { Check, Send } from "lucide-react"
import type { JSX, RefObject } from "react"
import { useEffect, useRef, useState } from "react"

type Props = {
  target: RefObject<HTMLElement | null>
  title: string
  label: string
  className: string
  iconClassName?: string
}

export const HomeShareButton = ({
  target,
  title,
  label,
  className,
  iconClassName,
}: Props): JSX.Element => {
  const [copied, setCopied] = useState(false)
  const sharing = useRef(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), HOME_SHARE_COPIED_MS)
    return () => clearTimeout(timer)
  }, [copied])

  const share = async (): Promise<void> => {
    if (sharing.current) return
    sharing.current = true

    try {
      const outcome = await shareScreen({ target: target.current, title })
      setCopied(outcome === "copied")
    } finally {
      sharing.current = false
    }
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
      <Icon size={18} className={cn("shrink-0", iconClassName)} />
      {copied ? "Copied to clipboard" : label}
    </button>
  )
}
