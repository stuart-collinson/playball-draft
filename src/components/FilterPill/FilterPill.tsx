import { cn } from "@pbd/lib/className"
import Link from "next/link"
import type { JSX, ReactNode } from "react"

type Props = {
  isActive: boolean
  activeClassName?: string
  href?: string
  onClick?: () => void
  children: ReactNode
}

const PILL_BASE = "rounded-full px-3 py-1 text-xs font-medium transition-colors"

const PILL_ACTIVE = "bg-accent text-foreground"

const PILL_INACTIVE = "text-muted-foreground hover:bg-accent hover:text-foreground"

export const FilterPill = ({
  isActive,
  activeClassName = PILL_ACTIVE,
  href,
  onClick,
  children,
}: Props): JSX.Element => {
  const className = cn(PILL_BASE, isActive ? activeClassName : PILL_INACTIVE)

  if (href !== undefined)
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  )
}
