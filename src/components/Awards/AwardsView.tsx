"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { useTRPC } from "@pbd/trpc/react";
import { AwardCard } from "./AwardCard";

type Props = {
  leagueIds: number[];
};

export const AwardsView = ({ leagueIds }: Props): JSX.Element => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.fpl.awards.queryOptions({ leagueIds }),
  );

  const awards = [
    {
      label: "Most Points",
      labelColor: "text-yellow-400",
      ruleColor: "bg-yellow-500/20",
      entry: data.mostPoints,
      value: `${data.mostPoints.value} pts`,
    },
    {
      label: "Least Points",
      labelColor: "text-red-400",
      ruleColor: "bg-red-500/20",
      entry: data.leastPoints,
      value: `${data.leastPoints.value} pts`,
    },
    {
      label: "Most GW Wins",
      labelColor: "text-green-400",
      ruleColor: "bg-green-500/20",
      entry: data.mostGwWins,
      value: String(data.mostGwWins.value),
    },
    {
      label: "Most GW Loses",
      labelColor: "text-orange-400",
      ruleColor: "bg-orange-500/20",
      entry: data.mostGwLasts,
      value: String(data.mostGwLasts.value),
    },
    {
      label: "Highest GW",
      labelColor: "text-emerald-400",
      ruleColor: "bg-emerald-500/20",
      entry: data.highestGwScore,
      value: `${data.highestGwScore.value} pts`,
      sub: data.highestGwScore.extra,
    },
    {
      label: "Lowest GW",
      labelColor: "text-rose-400",
      ruleColor: "bg-rose-500/20",
      entry: data.lowestGwScore,
      value: `${data.lowestGwScore.value} pts`,
      sub: data.lowestGwScore.extra,
    },
    {
      label: "Best Waiver",
      labelColor: "text-purple-400",
      ruleColor: "bg-purple-500/20",
      entry: data.bestWaiver,
      value: `${data.bestWaiver.value} pts`,
      sub: data.bestWaiver.extra,
    },
    {
      label: "Most Waivers",
      labelColor: "text-blue-400",
      ruleColor: "bg-blue-500/20",
      entry: data.mostWaivers,
      value: String(data.mostWaivers.value),
    },
    {
      label: "Net Gain",
      labelColor: "text-cyan-400",
      ruleColor: "bg-cyan-500/20",
      entry: data.highestNetGain,
      value: `${data.highestNetGain.value >= 0 ? "+" : ""}${data.highestNetGain.value.toFixed(1)}%`,
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {awards.map((award) => (
        <AwardCard
          key={award.label}
          label={award.label}
          labelColor={award.labelColor}
          ruleColor={award.ruleColor}
          managerName={award.entry.managerName}
          teamName={award.entry.teamName}
          value={award.value}
          sub={"sub" in award ? award.sub : undefined}
        />
      ))}
    </div>
  );
};
