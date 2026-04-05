import type { JSX } from "react";
import type { LeagueSlug } from "@pbd/lib/constants/fpl";
import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl";
import { fmtPts } from "@pbd/lib/utils/fmt";
import { ResultAvatar } from "@pbd/components/ResultAvatar";
import { BorderGlow } from "@pbd/components/ui/BorderGlow/border-glow";
import type { GameweekResultType } from "@pbd/types";

type Props = {
  result: GameweekResultType | null;
  type: "winner" | "loser";
  leagueSlug: LeagueSlug;
};

export const GameweekResult = ({
  result,
  type,
  leagueSlug,
}: Props): JSX.Element => {
  const isWinner = type === "winner";
  const ptColor = isWinner ? "text-green-400" : "text-red-400";
  const glowColor = isWinner ? "bg-green-500" : "bg-red-500";

  return (
    <BorderGlow
      edgeSensitivity={30}
      glowColor="40 80 80"
      backgroundColor="#060010"
      borderRadius={28}
      glowRadius={40}
      glowIntensity={1}
      coneSpread={25}
      animated={false}
      colors={["#c084fc", "#f472b6", "#38bdf8"]}
    >
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
        <div className="relative">
          <div
            className={`absolute inset-0 scale-[1.6] rounded-full blur-2xl opacity-25 ${glowColor}`}
          />
          {result?.image ? (
            <ResultAvatar imageUrl={result.image} type={type} size="md" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-muted" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-bold leading-tight text-foreground">
            {result?.name ?? "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {LEAGUE_LABELS[leagueSlug]}
          </p>
          <p className={`mt-1 text-xl font-black tabular-nums ${ptColor}`}>
            {result ? fmtPts(result.points) : "—"}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              pts
            </span>
          </p>
        </div>
      </div>
    </BorderGlow>
  );
};
