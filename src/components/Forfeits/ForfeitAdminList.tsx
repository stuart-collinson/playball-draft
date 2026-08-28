"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { ForfeitAdminRow } from "@pbd/components/Forfeits/ForfeitAdminRow"
import { Button } from "@pbd/components/ui/Button"
import { useForfeitFilters } from "@pbd/hooks/forfeits/useForfeitFilters"
import { useForfeitsList } from "@pbd/hooks/forfeits/useForfeitsList"
import { buildForfeitsListInput } from "@pbd/lib/forfeits"
import { COMBINED_SCOPE } from "@pbd/lib/leagues"
import type { JSX } from "react"

export const ForfeitAdminList = (): JSX.Element => {
  const { cadence, gameweek, type, subType, person, hasActiveFilters } = useForfeitFilters()

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useForfeitsList(
    buildForfeitsListInput(COMBINED_SCOPE, { cadence, gameweek, type, subType, person }),
  )
  const items = data.pages.flatMap((page) => page.items)

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
      {hasNextPage && (
        <Button
          variant="secondary"
          size="sm"
          className="self-center"
          onClick={() => void fetchNextPage()}
          isLoading={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading" : "Load more"}
        </Button>
      )}
    </div>
  )
}
