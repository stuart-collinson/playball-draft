"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { TransactionGroup } from "@pbd/components/Transactions/TransactionGroup"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pbd/components/ui/select"
import { useTransactionsFeed } from "@pbd/hooks/fpl/useTransactionsFeed"
import { useSearchParams } from "next/navigation"
import type { JSX } from "react"

type Props = {
  leagueId: number
}

const GAMEWEEK_PARAM = "gw"

export const TransactionsView = ({ leagueId }: Props): JSX.Element => {
  const feed = useTransactionsFeed(leagueId)
  const searchParams = useSearchParams()

  const requestedGameweek = Number(searchParams.get(GAMEWEEK_PARAM))
  const selectedGameweek = feed.gameweeks.includes(requestedGameweek)
    ? requestedGameweek
    : feed.gameweeks[0]

  if (selectedGameweek === undefined)
    return (
      <EmptyState
        title="No Transactions Yet"
        message="Waivers and trades appear here once the season is under way."
      />
    )

  const selectGameweek = (value: string): void => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(GAMEWEEK_PARAM, value)
    window.history.pushState(null, "", `?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <Select value={String(selectedGameweek)} onValueChange={selectGameweek}>
        <SelectTrigger className="w-36" aria-label="Game week">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card">
          {feed.gameweeks.map((gameweek) => (
            <SelectItem key={gameweek} value={String(gameweek)}>
              Game Week {gameweek}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-col gap-5">
        {(feed.movesByGameweek.get(selectedGameweek) ?? []).map((group) => (
          <TransactionGroup key={group.entryId} group={group} />
        ))}
      </div>
    </div>
  )
}
