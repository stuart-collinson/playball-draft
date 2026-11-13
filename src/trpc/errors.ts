import { TRPCClientError } from "@trpc/client"

type TrpcErrorData = {
  code?: string
  httpStatus?: number
}

export const trpcErrorData = (error: unknown): TrpcErrorData | null =>
  error instanceof TRPCClientError ? (error.data as TrpcErrorData | null) : null
