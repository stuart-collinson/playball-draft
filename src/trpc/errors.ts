import { TRPCClientError } from "@trpc/client"

type TrpcErrorData = {
  code?: string
  httpStatus?: number
}

export const trpcErrorData = (error: unknown): TrpcErrorData | undefined =>
  error instanceof TRPCClientError
    ? ((error.data ?? undefined) as TrpcErrorData | undefined)
    : undefined
