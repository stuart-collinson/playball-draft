import { STALE_FORFEITS_CURSOR_CODE } from "@pbd/lib/constants/Forfeits"
import { isClientErrorStatus, trpcErrorData } from "@pbd/trpc/errors"

export type NextPageRecovery = "retry" | "reset" | "reload"

const TIMEOUT_STATUS = 408

const TOO_MANY_REQUESTS_STATUS = 429

const PASSING_CLIENT_ERROR_STATUSES = new Set([TIMEOUT_STATUS, TOO_MANY_REQUESTS_STATUS])

export const nextPageRecovery = (error: unknown): NextPageRecovery => {
  const data = trpcErrorData(error)
  if (data?.code === STALE_FORFEITS_CURSOR_CODE) return "reset"
  if (isClientErrorStatus(data?.httpStatus) && !PASSING_CLIENT_ERROR_STATUSES.has(data.httpStatus))
    return "reload"

  return "retry"
}
