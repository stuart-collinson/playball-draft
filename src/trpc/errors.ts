import { TRPCClientError } from "@trpc/client"

type TrpcErrorData = {
  code?: string
  httpStatus?: number
}

const FIRST_CLIENT_ERROR_STATUS = 400

const FIRST_SERVER_ERROR_STATUS = 500

export const trpcErrorData = (error: unknown): TrpcErrorData | undefined =>
  error instanceof TRPCClientError
    ? ((error.data ?? undefined) as TrpcErrorData | undefined)
    : undefined

export const isClientErrorStatus = (httpStatus: number | undefined): httpStatus is number =>
  httpStatus !== undefined &&
  httpStatus >= FIRST_CLIENT_ERROR_STATUS &&
  httpStatus < FIRST_SERVER_ERROR_STATUS
