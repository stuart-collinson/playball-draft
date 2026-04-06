"use client";

import type { JSX } from "react";
import { Suspense } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pbd/components/ui/select";
import { TableSkeleton } from "@pbd/components/LeagueTable/TableSkeleton";
import { GwLeaderboardTable } from "@pbd/components/Tables/GwLeaderboardTable";
import { BestWaiversTable } from "@pbd/components/Tables/BestWaiversTable";
import useStatsStore from "@pbd/stores/statsStore";
import type { StatOption } from "@pbd/stores/statsStore";

type Props = {
  leagueIds: number[];
};

const STAT_OPTIONS: { value: StatOption; label: string }[] = [
  { value: "worst-gw", label: "Worst GW Scores" },
  { value: "best-gw", label: "Best GW Scores" },
  { value: "best-waivers", label: "Best Waivers (Total)" },
  { value: "best-waivers-avg", label: "Best Waivers (Avg PPG)" },
];

export const StatsView = ({ leagueIds }: Props): JSX.Element => {
  const selected = useStatsStore((s) => s.selectedStat);
  const setSelected = useStatsStore((s) => s.setSelectedStat);

  const suspenseKey = `${selected}-${leagueIds.join("-")}`;

  return (
    <div className="flex flex-col gap-4">
      <Select
        value={selected}
        onValueChange={(val) => setSelected(val as StatOption)}
      >
        <SelectTrigger className="w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card">
          {STAT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Suspense key={suspenseKey} fallback={<TableSkeleton />}>
        {selected === "worst-gw" && (
          <GwLeaderboardTable leagueIds={leagueIds} type="worst" />
        )}
        {selected === "best-gw" && (
          <GwLeaderboardTable leagueIds={leagueIds} type="best" />
        )}
        {selected === "best-waivers" && (
          <BestWaiversTable leagueIds={leagueIds} sortBy="total" />
        )}
        {selected === "best-waivers-avg" && (
          <BestWaiversTable leagueIds={leagueIds} sortBy="avg" />
        )}
      </Suspense>
    </div>
  );
};
