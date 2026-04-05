"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { LEAGUE_IDS, LEAGUE_SLUG_TO_ID } from "@pbd/lib/constants/fpl";
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants";
import type { LeagueDetailsResponse, Standing } from "@pbd/types/fpl.types";
import { useTRPC } from "@pbd/trpc/react";
import { LeagueTotals } from "./LeagueTotals";
import { ResultSection } from "./ResultSection";
import type { GameweekResultType } from "@pbd/types";

const getExtremeStanding = (
  data: LeagueDetailsResponse,
  type: "winner" | "loser",
): GameweekResultType | null => {
  if (!data.standings.length) return null;
  const sorted = [...data.standings].sort((a, b) =>
    type === "winner"
      ? b.event_total - a.event_total
      : a.event_total - b.event_total,
  );
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
    points: standing.event_total,
    image: participant?.image ?? null,
  };
};

export const GameweekResults = (): JSX.Element => {
  const trpc = useTRPC();
  const { data: premData } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({ leagueId: LEAGUE_IDS.PREMIERSHIP }),
  );
  const { data: champData } = useSuspenseQuery(
    trpc.fpl.leagueDetails.queryOptions({
      leagueId: LEAGUE_SLUG_TO_ID.championship,
    }),
  );

  const premTotal = premData.standings.reduce((sum, s) => sum + s.total, 0);
  const champTotal = champData.standings.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="animate-fade-up-delay-2 flex flex-col gap-4">
      <LeagueTotals premTotal={premTotal} champTotal={champTotal} />
      <ResultSection
        type="winner"
        premResult={getExtremeStanding(premData, "winner")}
        champResult={getExtremeStanding(champData, "winner")}
      />
      <ResultSection
        type="loser"
        premResult={getExtremeStanding(premData, "loser")}
        champResult={getExtremeStanding(champData, "loser")}
      />
    </div>
  );
};
