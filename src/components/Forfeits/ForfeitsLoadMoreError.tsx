import { Button } from "@pbd/components/ui/button"

type Props = {
  onRetry: () => void
  isRetrying: boolean
}

export const ForfeitsLoadMoreError = ({ onRetry, isRetrying }: Props) => (
  <div role="alert" className="flex flex-col items-center gap-2">
    <p className="text-center text-xs text-destructive">
      Couldn't load more forfeits. Try again, or reload the page if it keeps failing.
    </p>
    <Button variant="secondary" size="sm" onClick={onRetry} isLoading={isRetrying}>
      {isRetrying ? "Retrying" : "Try again"}
    </Button>
  </div>
)
