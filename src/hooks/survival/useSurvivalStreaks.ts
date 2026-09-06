import { survivalStreaksOptions } from "@pbd/hooks/survival/survival.cache"
import { useTRPC } from "@pbd/trpc/react"
import { useSuspenseQuery } from "@tanstack/react-query"

export const useSurvivalStreaks = () => {
  const trpc = useTRPC()

  return useSuspenseQuery(survivalStreaksOptions(trpc))
}
