"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { ForfeitCard } from "@pbd/components/Forfeits/ForfeitCard"
import { useForfeitFilters } from "@pbd/hooks/forfeits/useForfeitFilters"
import { useForfeitsList } from "@pbd/hooks/forfeits/useForfeitsList"
import { buildForfeitsListInput } from "@pbd/lib/forfeits"
import type { LeagueScope } from "@pbd/lib/leagues"
import type { JSX } from "react"
import { useEffect, useRef } from "react"

type Props = {
  scope: LeagueScope
}

export const ForfeitsGrid = ({ scope }: Props): JSX.Element => {
  const { cadence, gameweek, type, subType, person, hasActiveFilters } = useForfeitFilters()

  const query = useForfeitsList(
    buildForfeitsListInput(scope, { cadence, gameweek, type, subType, person }),
  )
  const items = query.data.pages.flatMap((page) => page.items)

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasActiveFilters || !hasNextPage) return

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && !isFetchingNextPage) void fetchNextPage()
    })
    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [hasActiveFilters, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (items.length === 0)
    return (
      <EmptyState
        title="No Forfeits"
        message={
          hasActiveFilters
            ? "Nothing matches those filters. Clear them to see the latest."
            : "No forfeits have been uploaded yet. Someone's overdue a pint."
        }
      />
    )

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((forfeit) => (
          <ForfeitCard key={forfeit.id} scope={scope} forfeit={forfeit} />
        ))}
      </div>
      {hasActiveFilters && hasNextPage && <div ref={sentinelRef} className="h-10" />}
      {isFetchingNextPage && (
        <p className="text-center text-xs text-muted-foreground">Loading more…</p>
      )}
      {!hasActiveFilters && hasNextPage && (
        <p className="text-center text-xs text-muted-foreground">
          Showing the 12 latest. Filter by week, type or person to find the rest.
        </p>
      )}
    </div>
  )
}
