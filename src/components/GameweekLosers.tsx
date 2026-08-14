"use client";

import type { JSX } from "react";
import { useGameState } from "@pbd/hooks/fpl/useGameState";
import { useGameweekSnapshot } from "@pbd/hooks/fpl/useGameweekSnapshot";
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants";
import { ResultAvatar } from "@pbd/components/ResultAvatar";
import { ResultAvatarSkeleton } from "@pbd/components/ResultAvatarSkeleton";

export const GameweekLosers = (): JSX.Element => {
  const {
    premDetails: { data: premData },
    champDetails: { data: champData },
    premGoals: { data: premGoals },
    champGoals: { data: champGoals },
  } = useGameweekSnapshot();
  const { data: gameState } = useGameState();
  const seasonOver = gameState?.seasonOver ?? false;
  // Every score is zero before the first gameweek, so there is no loser to
  // name — showing one would just pick whoever sorts first.
  const seasonNotStarted = gameState?.currentEvent === null;

  const getLoserImage = (
    data: typeof premData,
    goalsMap: Record<number, number> | undefined,
  ): string | null => {
    if (!data) return null;
    const goals = goalsMap ?? {};
    const sorted = [...data.standings].sort((a, b) => {
      if (seasonOver) return a.total - b.total;
      const pointsDiff = a.event_total - b.event_total;
      if (pointsDiff !== 0) return pointsDiff;
      return (goals[a.league_entry] ?? 0) - (goals[b.league_entry] ?? 0);
    });
    const loser = sorted[0];
    if (!loser) return null;
    return PARTICIPANT_BY_API_ID[loser.league_entry]?.image ?? null;
  };

  const premImage = getLoserImage(premData, premGoals);
  const champImage = getLoserImage(champData, champGoals);

  if (seasonNotStarted) return <div className="flex items-center gap-2" />;

  return (
    <div className="flex items-center gap-2">
      {premData ? (
        premImage && (
          <ResultAvatar imageUrl={premImage} type="loser" size="md" />
        )
      ) : (
        <ResultAvatarSkeleton />
      )}
      {champData ? (
        champImage && (
          <ResultAvatar imageUrl={champImage} type="loser" size="md" />
        )
      ) : (
        <ResultAvatarSkeleton />
      )}
    </div>
  );
};
