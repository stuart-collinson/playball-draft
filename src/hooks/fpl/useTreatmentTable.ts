import { treatmentTableOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import type { RouterInput } from "@pbd/types/api.types"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useTreatmentTable = (input: RouterInput["fpl"]["treatmentTable"]) => {
  const trpc = useTRPC()

  return useSuspenseQuery(treatmentTableOptions(trpc, input))
}
