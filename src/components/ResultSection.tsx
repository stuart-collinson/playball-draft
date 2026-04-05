import type { JSX } from "react";
import type { GameweekResultType } from "@pbd/types";
import { GameweekResult } from "@pbd/components/Cards/GameweekResult";

type Props = {
  type: "winner" | "loser";
  premResult: GameweekResultType | null;
  champResult: GameweekResultType | null;
};

export const ResultSection = ({
  type,
  premResult,
  champResult,
}: Props): JSX.Element => {
  const isWinner = type === "winner";
  const labelColor = isWinner ? "text-green-400" : "text-red-400";
  const ruleColor = isWinner ? "bg-green-500/20" : "bg-red-500/20";
  const label = isWinner ? "WINNERS" : "FORFEITS";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span
          className={`shrink-0 text-xs font-black uppercase tracking-[0.3em] ${labelColor}`}
        >
          {label}
        </span>
        <div className={`h-px flex-1 ${ruleColor}`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <GameweekResult
          result={premResult}
          type={type}
          leagueSlug="premiership"
        />
        <GameweekResult
          result={champResult}
          type={type}
          leagueSlug="championship"
        />
      </div>
    </div>
  );
};
