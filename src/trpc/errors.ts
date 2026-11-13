import { TRPCClientError } from "@trpc/client"

const FIRST_CLIENT_ERROR_STATUS = 400

const FIRST_SERVER_ERROR_STATUS = 500

export const isClientErrorResponse = (error: unknown): boolean => {
  if (!(error instanceof TRPCClientError)) return false

  const httpStatus = (error.data as { httpStatus?: number } | null)?.httpStatus
  return (
    typeof httpStatus === "number" &&
    httpStatus >= FIRST_CLIENT_ERROR_STATUS &&
    httpStatus < FIRST_SERVER_ERROR_STATUS
  )
}
