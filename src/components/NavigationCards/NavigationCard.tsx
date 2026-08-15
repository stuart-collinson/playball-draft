import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import type { JSX } from "react"

type Props = {
  href: string
  label: string
  icon: LucideIcon
  accent: string
}

export const NavigationCard = ({ href, label, icon: Icon, accent }: Props): JSX.Element => (
  <Link
    href={href}
    className="flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-lg border border-border/60 bg-card px-0.5 py-2.5 transition-all duration-150 hover:border-border hover:bg-accent/40 active:scale-95"
  >
    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
      <Icon size={17} strokeWidth={2.2} />
    </span>
    <span className="text-center text-[10px] font-semibold leading-[1.2] text-foreground/90">
      {label}
    </span>
  </Link>
)
