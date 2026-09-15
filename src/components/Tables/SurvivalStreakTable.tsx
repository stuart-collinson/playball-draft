"use client"

import { ManagerTable } from "@pbd/components/ManagerTable/ManagerTable"
import { useSurvivalStreaks } from "@pbd/hooks/survival/useSurvivalStreaks"
import { CURRENT_SEASON } from "@pbd/lib/constants/App"
import { LEAGUE_LABELS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/Fpl"
import { participantApiIdForSlug, participantLabelForSlug } from "@pbd/lib/people"
import { rankSurvivalStreaks } from "@pbd/lib/survival"
import type { ManagerTableColumn, ManagerTableRow } from "@pbd/types/managerTable.types"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

const PRE_SEASON_GAMEWEEK = 0

const UNKNOWN_API_ID = 0

const COLUMNS: ManagerTableColumn[] = [{ key: "weeks", header: "Weeks", className: "w-14" }]

const asOfLabel = (season: string, gameweek: number): string => {
  if (season !== CURRENT_SEASON) return `As of GW ${gameweek}, ${season}`
  if (gameweek === PRE_SEASON_GAMEWEEK) return "Carried over from last season"
  return `After GW ${gameweek}`
}

export const SurvivalStreakTable = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useSurvivalStreaks()

  const ranked = rankSurvivalStreaks(
    data.streaks.filter((streak) => leagueIds.includes(LEAGUE_SLUG_TO_ID[streak.league])),
  )

  const rows: ManagerTableRow[] = ranked.map((row) => ({
    key: row.person,
    rank: row.rank,
    entryApiId: participantApiIdForSlug(row.person) ?? UNKNOWN_API_ID,
    leagueId: LEAGUE_SLUG_TO_ID[row.league],
    managerName: participantLabelForSlug(row.person),
    subtitle: LEAGUE_LABELS[row.league],
    cells: { weeks: row.weeksSinceLoss },
  }))

  return (
    <div className="flex flex-col gap-2">
      {rows.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {asOfLabel(data.asOfSeason, data.asOfGameweek)}
        </p>
      )}
      <ManagerTable
        columns={COLUMNS}
        rows={rows}
        showFaces
        emptyTitle="No Streaks Yet"
        emptyMessage="Nobody's survival streak has been recorded yet."
      />
    </div>
  )
}
