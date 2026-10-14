import {
  bootstrapStaticOptions,
  entryEventPicksOptions,
  eventLiveOptions,
} from "@pbd/hooks/fpl/fpl.cache"
import { useGameState } from "@pbd/hooks/fpl/useGameState"
import { useLiveFreshness } from "@pbd/hooks/fpl/useLiveFreshness"
import { useTRPC } from "@pbd/trpc/react"
import { useQuery } from "@tanstack/react-query"

export const useSquadViewData = (entryId: number, gameweek?: number) => {
  const trpc = useTRPC()
  const liveFreshness = useLiveFreshness()
  const { data: gameState } = useGameState()
  const currentEvent = gameState?.currentEvent ?? 0
  const event = gameweek ?? currentEvent

  const bootstrap = useQuery(bootstrapStaticOptions(trpc))
  const picks = useQuery({
    ...entryEventPicksOptions(trpc, entryId, event),
    enabled: entryId > 0 && event > 0,
  })
  const live = useQuery({
    ...eventLiveOptions(trpc, event),
    ...liveFreshness,
    enabled: event > 0,
  })

  return { bootstrap, picks, live, currentEvent }
}
