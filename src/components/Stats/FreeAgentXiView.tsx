"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { LeagueStack } from "@pbd/components/LeagueStack/LeagueStack"
import { PitchSurface } from "@pbd/components/Pitch/PitchSurface"
import { useFreeAgentXi } from "@pbd/hooks/fpl/useFreeAgentXi"
import { LEAGUE_IDS, LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import { fmtPts } from "@pbd/lib/utils/fmt"
import type { PitchRow } from "@pbd/types/pitch.types"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

const POSITION_ROW_ORDER = [1, 2, 3, 4] as const

export const FreeAgentXiView = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useFreeAgentXi({ leagueIds })

  const withXi = data.filter((result) => result.xi !== null)
  if (withXi.length === 0)
    return (
      <EmptyState
        title="No Free Agent XI"
        message="There aren't enough unowned players to field a legal team."
      />
    )

  return (
    <LeagueStack leagueIds={withXi.map((result) => result.leagueId)} gap="loose">
      {(leagueId) => {
        const xi = withXi.find((result) => result.leagueId === leagueId)?.xi
        if (!xi) return null
        const rows: PitchRow[] = POSITION_ROW_ORDER.flatMap((posType) => {
          const players = xi.players.filter((player) => player.positionType === posType)
          if (!players.length) return []
          return [
            {
              key: String(posType),
              players: players.map((player) => ({
                key: String(player.elementId),
                name: player.webName,
                club: player.teamShort,
                value: fmtPts(player.seasonPoints),
              })),
            },
          ]
        })
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {leagueId === LEAGUE_IDS.PREMIERSHIP
                  ? LEAGUE_LABELS.premiership
                  : LEAGUE_LABELS.championship}{" "}
                · {xi.formation}
              </p>
              <p className="text-xs font-black tabular-nums text-foreground">
                {fmtPts(xi.totalPoints)} pts
              </p>
            </div>
            <PitchSurface rows={rows} />
          </div>
        )
      }}
    </LeagueStack>
  )
}
