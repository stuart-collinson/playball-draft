"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { ForfeitAdminRow } from "@pbd/components/Forfeits/Admin/ForfeitAdminRow"
import { ForfeitsLoadMoreError } from "@pbd/components/Forfeits/ForfeitsLoadMoreError"
import { Button } from "@pbd/components/ui/button"
import { useForfeitFilters } from "@pbd/hooks/forfeits/useForfeitFilters"
import { useForfeitsList } from "@pbd/hooks/forfeits/useForfeitsList"
import { useForfeitsLoadMore } from "@pbd/hooks/forfeits/useForfeitsLoadMore"
import { buildForfeitsListInput } from "@pbd/lib/forfeits/filters"
import { COMBINED_SCOPE } from "@pbd/lib/leagues"
import type { JSX } from "react"

export const ForfeitAdminList = (): JSX.Element => {
  const { cadence, gameweek, type, subType, person, hasActiveFilters } = useForfeitFilters()

  const query = useForfeitsList(
    buildForfeitsListInput(COMBINED_SCOPE, { cadence, gameweek, type, subType, person }),
  )
  const { isLoadingMore, failure, loadMore } = useForfeitsLoadMore(query)
  const items = query.data.pages.flatMap((page) => page.items)

  if (items.length === 0)
    return (
      <EmptyState
        title="No Forfeits"
        message={
          hasActiveFilters
            ? "Nothing matches those filters. Clear them to see the latest."
            : "Nothing uploaded yet. Use Upload Forfeit to add the first one."
        }
      />
    )

  return (
    <div className="flex flex-col gap-2">
      {items.map((forfeit) => (
        <ForfeitAdminRow key={forfeit.id} forfeit={forfeit} />
      ))}
      {failure && (
        <ForfeitsLoadMoreError
          error={failure.error}
          onRetry={failure.retry}
          isRetrying={failure.isRetrying}
        />
      )}
      {query.hasNextPage && !failure && (
        <Button
          variant="secondary"
          size="sm"
          className="self-center"
          onClick={loadMore}
          isLoading={isLoadingMore}
        >
          {isLoadingMore ? "Loading" : "Load more"}
        </Button>
      )}
    </div>
  )
}
