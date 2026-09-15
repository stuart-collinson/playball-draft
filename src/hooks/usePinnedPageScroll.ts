"use client"

import { useEffect } from "react"

export const usePinnedPageScroll = (isActive: boolean): void => {
  useEffect(() => {
    if (!isActive) return

    const scrollY = window.scrollY
    if (scrollY === 0 || document.body.style.marginTop !== "") return

    document.body.style.marginTop = `-${scrollY}px`
    window.scrollTo(0, 0)

    return () => {
      document.body.style.marginTop = ""
      window.scrollTo(0, scrollY)
    }
  }, [isActive])
}
