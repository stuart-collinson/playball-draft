import { STALE_FORFEITS_CURSOR_CODE } from "@pbd/lib/constants/Forfeits"
import { trpcErrorData } from "@pbd/trpc/errors"

export const isRejectedCursorError = (error: unknown): boolean =>
  trpcErrorData(error)?.code === STALE_FORFEITS_CURSOR_CODE
