"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { ForfeitCard } from "@pbd/components/Forfeits/ForfeitCard"
import { ForfeitsLoadMoreError } from "@pbd/components/Forfeits/ForfeitsLoadMoreError"
import { useForfeitFilters } from "@pbd/hooks/forfeits/useForfeitFilters"
import { useForfeitsList } from "@pbd/hooks/forfeits/useForfeitsList"
import { useForfeitsLoadMore } from "@pbd/hooks/forfeits/useForfeitsLoadMore"
import { buildForfeitsListInput } from "@pbd/lib/forfeits/filters"
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

  const { hasNextPage, isFetchingNextPage } = query
  const { canLoadMore, failure, loadMore } = useForfeitsLoadMore(query)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasActiveFilters || !canLoadMore) return

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMore()
    })
    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [hasActiveFilters, canLoadMore, loadMore])

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
      {isFetchingNextPage && !failure && (
        <p className="text-center text-xs text-muted-foreground">Loading more…</p>
      )}
      {failure && (
        <ForfeitsLoadMoreError
          error={failure.error}
          onRetry={failure.retry}
          isRetrying={failure.isRetrying}
        />
      )}
      {!hasActiveFilters && hasNextPage && (
        <p className="text-center text-xs text-muted-foreground">
          Showing the {items.length} most recent by gameweek. Filter by week, type or person to
          find the rest.
        </p>
      )}
    </div>
  )
}
