"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { RankBadge } from "@pbd/components/LeagueTable/RankBadge"
import { LuckPersonFace } from "@pbd/components/Luck/LuckPersonFace"
import { useSurvivalStreaks } from "@pbd/hooks/survival/useSurvivalStreaks"
import { CURRENT_SEASON } from "@pbd/lib/constants/app"
import { LEAGUE_LABELS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl"
import { participantLabelForSlug } from "@pbd/lib/people"
import { rankSurvivalStreaks } from "@pbd/lib/survival"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

const PRE_SEASON_GAMEWEEK = 0

const asOfLabel = (season: string, gameweek: number): string => {
  if (season !== CURRENT_SEASON) return `As of GW ${gameweek}, ${season}`
  if (gameweek === PRE_SEASON_GAMEWEEK) return "Carried over from last season"
  return `After GW ${gameweek}`
}

export const SurvivalStreakTable = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useSurvivalStreaks()

  const rows = rankSurvivalStreaks(
    data.streaks.filter((streak) => leagueIds.includes(LEAGUE_SLUG_TO_ID[streak.league])),
  )

  if (rows.length === 0)
    return (
      <EmptyState
        title="No Streaks Yet"
        message="Nobody's survival streak has been recorded yet."
      />
    )

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        {asOfLabel(data.asOfSeason, data.asOfGameweek)}
      </p>
      {rows.map((row) => (
        <div
          key={row.person}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
        >
          <RankBadge rank={row.rank} />
          <LuckPersonFace slug={row.person} />

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">
              {participantLabelForSlug(row.person)}
            </p>
            <p className="truncate text-xs text-muted-foreground">{LEAGUE_LABELS[row.league]}</p>
          </div>

          <div className="w-16 shrink-0 text-right">
            <p className="text-base font-black tabular-nums text-foreground">
              {row.weeksSinceLoss}
            </p>
            <p className="text-[10px] text-muted-foreground/60">Weeks</p>
          </div>
        </div>
      ))}
    </div>
  )
}
