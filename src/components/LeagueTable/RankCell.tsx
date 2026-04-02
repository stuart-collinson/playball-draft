import { ArrowDown, ArrowUp } from "lucide-react"
import type { JSX } from "react"

type RankCellProps = {
  rank: number
  lastRank: number
  showArrows?: boolean
}

export const RankCell = ({ rank, lastRank, showArrows = true }: RankCellProps): JSX.Element => {
  const isFirst = rank === 1
  const improved = lastRank > 0 && rank < lastRank
  const dropped = lastRank > 0 && rank > lastRank

  return (
    <div className="flex items-center gap-1.5">
      {isFirst ? (
        <span className="text-base">👑</span>
      ) : (
        <span className="w-5 text-sm font-semibold tabular-nums text-foreground">{rank}</span>
      )}
      {showArrows && improved && (
        <ArrowUp className="h-3.5 w-3.5 text-rank-up" aria-label="rank improved" />
      )}
      {showArrows && dropped && (
        <ArrowDown className="h-3.5 w-3.5 text-rank-down" aria-label="rank dropped" />
      )}
    </div>
  )
}
