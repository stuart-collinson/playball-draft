import type { AppRouter } from "@pbd/server/routers/index"
import { TRPCClientError } from "@trpc/client"

const FIRST_CLIENT_ERROR_STATUS = 400

const FIRST_SERVER_ERROR_STATUS = 500

const trpcHttpStatus = (error: unknown): number | undefined =>
  error instanceof TRPCClientError
    ? (error as TRPCClientError<AppRouter>).data?.httpStatus
    : undefined

export const isClientError = (error: unknown): boolean => {
  const httpStatus = trpcHttpStatus(error)

  return (
    httpStatus !== undefined &&
    httpStatus >= FIRST_CLIENT_ERROR_STATUS &&
    httpStatus < FIRST_SERVER_ERROR_STATUS
  )
}
