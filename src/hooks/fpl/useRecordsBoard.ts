import { recordsBoardOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useRecordsBoard = (input: RouterInput["fpl"]["recordsBoard"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(recordsBoardOptions(trpc, input))
}
