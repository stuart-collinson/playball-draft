import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import type { JSX } from "react"

type Props = {
  href: string
}

export const BackLink = ({ href }: Props): JSX.Element => (
  <Link
    href={href}
    aria-label="Back"
    className="-ml-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground/80 transition-colors hover:border-primary/50 hover:bg-accent hover:text-foreground"
  >
    <ChevronLeft size={20} strokeWidth={2} />
  </Link>
)
