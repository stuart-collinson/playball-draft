import { TransactionArrow } from "@pbd/components/Transactions/TransactionArrow"
import { TransactionPlayer } from "@pbd/components/Transactions/TransactionPlayer"
import type { TransactionKind, TransactionMove } from "@pbd/lib/fpl/transactionFeed"
import { cn } from "@pbd/lib/utils/cn"
import type { JSX } from "react"

type Props = {
  move: TransactionMove
}

const KIND_BADGES: Record<TransactionKind, { label: string; className: string }> = {
  waiver: { label: "Waiver", className: "bg-sky-500/20 text-sky-400" },
  freeAgent: { label: "Free Agent", className: "bg-violet-500/20 text-violet-400" },
  trade: { label: "Trade", className: "bg-purple-500/20 text-purple-400" },
}

export const TransactionRow = ({ move }: Props): JSX.Element => {
  const badge = KIND_BADGES[move.kind]

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
      <TransactionPlayer player={move.playerOut} align="right" />

      <div className="flex w-24 shrink-0 flex-col items-center gap-1">
        <TransactionArrow />
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-bold leading-none",
            badge.className,
          )}
        >
          {badge.label}
        </span>
        {move.counterparty !== null && (
          <span className="max-w-full truncate text-[10px] leading-none text-muted-foreground">
            with {move.counterparty}
          </span>
        )}
      </div>

      <TransactionPlayer player={move.playerIn} align="left" />
    </div>
  )
}
