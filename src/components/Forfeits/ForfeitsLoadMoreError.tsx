import { Button } from "@pbd/components/ui/button"
import { isClientError } from "@pbd/trpc/errors"
import type { ForfeitsLoadMoreFailure } from "@pbd/types/forfeits.types"

type Props = {
  failure: ForfeitsLoadMoreFailure
}

const reloadPage = (): void => window.location.reload()

export const ForfeitsLoadMoreError = ({ failure }: Props) => {
  const needsReload = isClientError(failure.error)
  const isRetrying = failure.isRetrying && !needsReload
  const actionLabel = needsReload ? "Reload the page" : "Try again"

  return (
    <div role="alert" className="flex flex-col items-center gap-2">
      <p className="text-center text-xs text-destructive">Couldn't load more forfeits.</p>
      <Button
        variant="secondary"
        size="sm"
        onClick={needsReload ? reloadPage : failure.retry}
        isLoading={isRetrying}
      >
        {isRetrying ? "Retrying" : actionLabel}
      </Button>
    </div>
  )
}
