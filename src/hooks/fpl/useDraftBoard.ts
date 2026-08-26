import { draftBoardOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useDraftBoard = (input: RouterInput["fpl"]["draftBoard"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(draftBoardOptions(trpc, input))
}
