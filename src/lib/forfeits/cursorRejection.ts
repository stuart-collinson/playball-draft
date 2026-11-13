import { TRPCClientError } from "@trpc/client"

const REJECTED_INPUT_CODE = "BAD_REQUEST"

export const isRejectedCursorError = (error: unknown): boolean =>
  error instanceof TRPCClientError &&
  (error.data as { code?: string } | null)?.code === REJECTED_INPUT_CODE
