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
    className="flex min-h-[92px] flex-col items-center justify-center gap-2.5 rounded-xl border border-border/60 bg-card px-1 py-3 transition-all duration-150 hover:border-border hover:bg-accent/40 active:scale-95"
  >
    <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
      <Icon size={21} strokeWidth={2.2} />
    </span>
    <span className="text-center text-[11px] font-semibold leading-[1.2] text-foreground/90">
      {label}
    </span>
  </Link>
)
