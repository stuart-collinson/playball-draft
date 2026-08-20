import type { MovePlayer } from "@pbd/lib/fpl/transactionFeed"
import { cn } from "@pbd/lib/utils/cn"
import type { JSX } from "react"

type Props = {
  player: MovePlayer | null
  align: "left" | "right"
}

export const TransactionPlayer = ({ player, align }: Props): JSX.Element => (
  <div className={cn("min-w-0 flex-1", align === "right" ? "text-right" : "text-left")}>
    {player === null ? (
      <p className="text-sm text-muted-foreground">—</p>
    ) : (
      <>
        <p className="truncate text-sm font-semibold text-foreground">{player.name}</p>
        {player.team && (
          <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
            {player.team}
          </p>
        )}
      </>
    )}
  </div>
)
