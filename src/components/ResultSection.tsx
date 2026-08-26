import type { JSX } from "react";
import type { GameweekResultType } from "@pbd/types";
import { GameweekResult } from "@pbd/components/Cards/GameweekResult";
import { ResultSectionHeader } from "@pbd/components/ResultSectionHeader";

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
  return (
    <div className="flex flex-col gap-4">
      <ResultSectionHeader type={type} />
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
