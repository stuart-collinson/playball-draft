import { ArrowDown, ArrowUp } from "lucide-react";
import type { JSX } from "react";

type Props = {
  rank: number;
  lastRank?: number;
  showArrows?: boolean;
};

export const RankBadge = ({
  rank,
  lastRank = 0,
  showArrows = false,
}: Props): JSX.Element => {
  const improved = showArrows && lastRank > 0 && rank < lastRank;
  const dropped = showArrows && lastRank > 0 && rank > lastRank;

  return (
    <div className="flex w-10 shrink-0 flex-col items-center gap-0.5">
      {rank === 1 ? (
        <div className="relative flex h-8 w-8 items-end justify-center pb-0.5">
          <span className="absolute -top-0.5 left-1/2 -translate-x-[25%] rotate-12 text-sm leading-none select-none">
            👑
          </span>
          <span className="text-base font-black text-foreground">1</span>
        </div>
      ) : (
        <span className="flex h-8 w-8 items-center justify-center text-base font-black tabular-nums text-muted-foreground">
          {rank}
        </span>
      )}
      {improved && <ArrowUp className="h-3 w-3 text-rank-up" />}
      {dropped && <ArrowDown className="h-3 w-3 text-rank-down" />}
    </div>
  );
};
