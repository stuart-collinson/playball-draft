import { Button } from "@pbd/components/ui/button"
import type { NextPageRecovery } from "@pbd/lib/forfeits/nextPageRecovery"

type Props = {
  recovery: NextPageRecovery
  onRecover: () => void
  isRetrying: boolean
}

type RecoveryCopy = {
  message: string
  action: string
}

const RECOVERY_COPY: Record<NextPageRecovery, RecoveryCopy> = {
  retry: { message: "Couldn't load more forfeits.", action: "Try again" },
  reset: { message: "The list has changed since it loaded.", action: "Reload the list" },
  reload: { message: "Couldn't load more forfeits.", action: "Reload the page" },
}

export const ForfeitsLoadMoreError = ({ recovery, onRecover, isRetrying }: Props) => {
  const copy = RECOVERY_COPY[recovery]

  return (
    <div role="alert" className="flex flex-col items-center gap-2">
      <p className="text-center text-xs text-destructive">{copy.message}</p>
      <Button variant="secondary" size="sm" onClick={onRecover} isLoading={isRetrying}>
        {isRetrying ? "Retrying" : copy.action}
      </Button>
    </div>
  )
}
