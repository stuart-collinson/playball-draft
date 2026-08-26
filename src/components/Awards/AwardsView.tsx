"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { useAwards } from "@pbd/hooks/fpl/useAwards"
import { AWARD_DEFINITIONS, formatAwardValue } from "@pbd/lib/constants/Awards"
import type { JSX } from "react"
import { AwardCard } from "./AwardCard"

type Props = {
  leagueIds: number[]
}

export const AwardsView = ({ leagueIds }: Props): JSX.Element => {
  const { data } = useAwards(leagueIds)

  if (data === null)
    return (
      <EmptyState
        title="No Awards Yet"
        message="Awards are handed out once the first gameweek is complete."
      />
    )

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {AWARD_DEFINITIONS.map((award) => {
        const entry = data[award.key]

        return (
          <AwardCard
            key={award.key}
            label={award.label}
            labelColor={award.labelColor}
            ruleColor={award.ruleColor}
            managerName={entry.managerName}
            teamName={entry.teamName}
            value={formatAwardValue(award.format, entry.value)}
            sub={award.hasDetail ? entry.extra : undefined}
          />
        )
      })}
    </div>
  )
}
