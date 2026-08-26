import type { JSX } from "react"

type ResultSectionHeaderProps = {
  type: "winner" | "loser"
}

const HEADINGS = {
  winner: { label: "WINNERS", labelColor: "text-green-400", ruleColor: "bg-green-500/20" },
  loser: { label: "FORFEITS", labelColor: "text-red-400", ruleColor: "bg-red-500/20" },
} as const

export const ResultSectionHeader = ({ type }: ResultSectionHeaderProps): JSX.Element => {
  const { label, labelColor, ruleColor } = HEADINGS[type]

  return (
    <div className="flex items-center gap-3">
      <span className={`shrink-0 text-xs font-black uppercase tracking-[0.3em] ${labelColor}`}>
        {label}
      </span>
      <div className={`h-px flex-1 ${ruleColor}`} />
    </div>
  )
}
