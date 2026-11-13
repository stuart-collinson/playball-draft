import { Button } from "@pbd/components/ui/button"
import { isClientError } from "@pbd/trpc/errors"

type Props = {
  error: unknown
  onRetry: () => void
  isRetrying: boolean
}

const reloadPage = (): void => window.location.reload()

export const ForfeitsLoadMoreError = ({ error, onRetry, isRetrying }: Props) => {
  const needsReload = isClientError(error)
  const actionLabel = needsReload ? "Reload the page" : "Try again"

  return (
    <div role="alert" className="flex flex-col items-center gap-2">
      <p className="text-center text-xs text-destructive">Couldn't load more forfeits.</p>
      <Button
        variant="secondary"
        size="sm"
        onClick={needsReload ? reloadPage : onRetry}
        isLoading={isRetrying}
      >
        {isRetrying ? "Retrying" : actionLabel}
      </Button>
    </div>
  )
}
