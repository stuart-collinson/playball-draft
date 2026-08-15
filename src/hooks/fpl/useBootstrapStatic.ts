import { bootstrapStaticOptions } from "@pbd/hooks/fpl/fpl.cache"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useBootstrapStatic = () => {
  const trpc = useTRPC()

  return useSuspenseQuery(bootstrapStaticOptions(trpc))
}
