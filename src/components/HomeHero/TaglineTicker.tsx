"use client"

import { TAGLINES, TAGLINE_ROTATION_MS } from "@pbd/lib/constants/Taglines"
import type { JSX } from "react"
import { useEffect, useState } from "react"

export const TaglineTicker = (): JSX.Element => {
  const [index, setIndex] = useState<number | null>(null)

  useEffect(() => {
    setIndex(Math.floor(Math.random() * TAGLINES.length))

    const rotation = setInterval(
      () => setIndex((current) => ((current ?? 0) + 1) % TAGLINES.length),
      TAGLINE_ROTATION_MS,
    )

    return () => clearInterval(rotation)
  }, [])

  return (
    <span
      key={index ?? "pending"}
      className={index === null ? "inline-block invisible" : "inline-block animate-fade-in"}
    >
      {TAGLINES[index ?? 0] ?? TAGLINES[0]}
    </span>
  )
}
