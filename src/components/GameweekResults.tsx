"use client";

import type { JSX } from "react";
import { useBothLeagueDetails } from "@pbd/hooks/fpl/useBothLeagueDetails";
import { useCurrentGwGoalsScored } from "@pbd/hooks/fpl/useCurrentGwGoalsScored";
import { useGameState } from "@pbd/hooks/fpl/useGameState";
import { LEAGUE_IDS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl";
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants";
import type { LeagueDetailsResponse, Standing } from "@pbd/types/fpl.types";
import { GameweekResultsSkeleton } from "./GameweekResultsSkeleton";
import { LeagueTotals } from "./LeagueTotals";
import { ResultSection } from "./ResultSection";
import { SeasonCountdown } from "./SeasonCountdown";
import type { GameweekResultType } from "@pbd/types";

const getExtremeStanding = (
  data: LeagueDetailsResponse,
  type: "winner" | "loser",
  goalsMap: Record<number, number>,
  seasonOver: boolean,
): GameweekResultType | null => {
  if (!data.standings.length) return null;
  const sorted = [...data.standings].sort((a, b) => {
    if (seasonOver) {
      return type === "winner" ? b.total - a.total : a.total - b.total;
    }
    const pointsDiff =
      type === "winner"
        ? b.event_total - a.event_total
        : a.event_total - b.event_total;
    if (pointsDiff !== 0) return pointsDiff;
    const aGoals = goalsMap[a.league_entry] ?? 0;
    const bGoals = goalsMap[b.league_entry] ?? 0;
    return type === "winner" ? bGoals - aGoals : aGoals - bGoals;
  });
  const standing = sorted[0] as Standing;
  const entry = data.league_entries.find((e) => e.id === standing.league_entry);
  const participant = entry ? PARTICIPANT_BY_API_ID[entry.id] : null;
  return {
    name:
      participant?.nickname ??
      participant?.name ??
      (entry
        ? `${entry.player_first_name} ${entry.player_last_name}`
        : "Unknown"),
    points: seasonOver ? standing.total : standing.event_total,
    image: participant?.image ?? null,
  };
};

export const GameweekResults = (): JSX.Element => {
  const { premData, champData } = useBothLeagueDetails();
  const { data: premGoals } = useCurrentGwGoalsScored(LEAGUE_IDS.PREMIERSHIP);
  const { data: champGoals } = useCurrentGwGoalsScored(
    LEAGUE_SLUG_TO_ID.championship,
  );
  const { data: gameState } = useGameState();

  // Wait for the heartbeat rather than guessing: rendering results first and
  // swapping to the countdown a moment later would flash a bogus winner.
  if (!gameState) return <GameweekResultsSkeleton />;

  // Before the first gameweek every score is zero, so "winner" and "loser"
  // would both resolve to whoever happens to sit first in the standings.
  // There is nothing to report yet — count down to the deadline instead.
  if (gameState.currentEvent === null)
    return <SeasonCountdown deadline={gameState.nextDeadline} />;

  const seasonOver = gameState.seasonOver;

  const premTotal = premData.standings.reduce((sum, s) => sum + s.total, 0);
  const champTotal = champData.standings.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="animate-fade-up-delay-2 flex flex-col gap-4">
      <LeagueTotals premTotal={premTotal} champTotal={champTotal} />
      <ResultSection
        type="winner"
        premResult={getExtremeStanding(premData, "winner", premGoals, seasonOver)}
        champResult={getExtremeStanding(champData, "winner", champGoals, seasonOver)}
      />
      <ResultSection
        type="loser"
        premResult={getExtremeStanding(premData, "loser", premGoals, seasonOver)}
        champResult={getExtremeStanding(champData, "loser", champGoals, seasonOver)}
      />
    </div>
  );
};
