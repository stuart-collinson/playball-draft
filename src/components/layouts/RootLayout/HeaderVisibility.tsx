"use client"

import { usePathname } from "next/navigation"
import type { JSX } from "react"
import { Header } from "./Header"

export const HeaderVisibility = (): JSX.Element | null => {
  const pathname = usePathname()
  if (pathname === "/home") return null
  return <Header />
}
