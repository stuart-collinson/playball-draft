import type { JSX } from "react";
import { fmtPts } from "@pbd/lib/utils/fmt";

type Props = {
  premTotal: number;
  champTotal: number;
};

export const LeagueTotals = ({ premTotal, champTotal }: Props): JSX.Element => (
  <div className="flex items-center justify-center gap-4">
    <div className="flex flex-col items-center">
      <span className="text-xs font-semibold text-muted-foreground">
        Premiership
      </span>
      <span className="text-xl font-black tabular-nums text-green-400">
        {fmtPts(premTotal)}
      </span>
    </div>
    <span className="text-sm font-bold text-muted-foreground/40">vs</span>
    <div className="flex flex-col items-center">
      <span className="text-xs font-semibold text-muted-foreground">
        Championship
      </span>
      <span className="text-xl font-black tabular-nums text-purple-400">
        {fmtPts(champTotal)}
      </span>
    </div>
  </div>
);
