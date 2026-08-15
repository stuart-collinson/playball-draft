import {
  bootstrapStaticOptions,
  entryEventPicksOptions,
  eventLiveOptions,
} from "@pbd/hooks/fpl/fpl.cache"
import { useGameState } from "@pbd/hooks/fpl/useGameState"
import { useLivePollInterval } from "@pbd/hooks/fpl/useLivePollInterval"
import { useTRPC } from "@pbd/trpc/react"
import { useQuery } from "@tanstack/react-query"

export const useSquadViewData = (entryId: number) => {
  const trpc = useTRPC()
  const pollInterval = useLivePollInterval()
  const { data: gameState } = useGameState()
  const currentEvent = gameState?.currentEvent ?? 0

  const bootstrap = useQuery(bootstrapStaticOptions(trpc))
  const picks = useQuery({
    ...entryEventPicksOptions(trpc, entryId, currentEvent),
    enabled: entryId > 0 && currentEvent > 0,
  })
  const live = useQuery({
    ...eventLiveOptions(trpc, currentEvent),
    refetchInterval: pollInterval,
    enabled: currentEvent > 0,
  })

  return { bootstrap, picks, live, currentEvent }
}
