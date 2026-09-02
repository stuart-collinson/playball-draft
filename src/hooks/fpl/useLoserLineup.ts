import { useSquadViewData } from "@pbd/hooks/fpl/useSquadViewData"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"
import { buildStarterRows, livePointsFor } from "@pbd/lib/fpl/lineup"
import type { PitchRow } from "@pbd/types/pitch.types"
import { useMemo } from "react"

const NO_ENTRY = 0

export const useLoserLineup = (apiId: number | null): PitchRow[] | null => {
  const entryId = apiId === null ? NO_ENTRY : (PARTICIPANT_BY_API_ID[apiId]?.entryId ?? NO_ENTRY)

  const { bootstrap, picks, live } = useSquadViewData(entryId)

  return useMemo(() => {
    if (!bootstrap.data || !picks.data) return null

    return buildStarterRows(
      picks.data.picks,
      bootstrap.data.elements,
      bootstrap.data.teams,
      (elementId) => String(livePointsFor(live.data ?? null, elementId)),
    )
  }, [bootstrap.data, picks.data, live.data])
}
