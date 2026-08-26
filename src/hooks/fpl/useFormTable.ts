import { formTableOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useFormTable = (input: RouterInput["fpl"]["formTable"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(formTableOptions(trpc, input))
}
