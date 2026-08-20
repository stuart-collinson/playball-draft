import { TransactionRow } from "@pbd/components/Transactions/TransactionRow"
import { summariseMoves } from "@pbd/lib/fpl/transactionFeed"
import type { ManagerMoves } from "@pbd/lib/fpl/transactionFeed"
import Image from "next/image"
import type { JSX } from "react"

type Props = {
  group: ManagerMoves
}

const AVATAR_SIZE = 28

export const TransactionGroup = ({ group }: Props): JSX.Element => (
  <section className="flex flex-col gap-2">
    <header className="flex items-center gap-2.5">
      {group.image && (
        <Image
          src={group.image}
          alt={group.managerName}
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-border"
        />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{group.managerName}</p>
        {group.teamName && (
          <p className="truncate text-[11px] text-muted-foreground">{group.teamName}</p>
        )}
      </div>

      <p className="shrink-0 text-[11px] font-medium text-muted-foreground">
        {summariseMoves(group.moves)}
      </p>
    </header>

    <div className="flex flex-col gap-2">
      {group.moves.map((move) => (
        <TransactionRow key={move.id} move={move} />
      ))}
    </div>
  </section>
)
