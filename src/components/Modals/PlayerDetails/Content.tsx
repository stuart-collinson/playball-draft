"use client";

import React from "react";
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants";
import { useTRPC } from "@pbd/trpc/react";
import type { FplElement } from "@pbd/types/fpl.types";
import type { PlayerDialogData } from "@pbd/types/player.types";
import { useQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { useMemo } from "react";
import { StatCell } from "../StatCell";

type Props = {
  player: PlayerDialogData;
};

const PlayerDetailsContent = ({ player }: Props): JSX.Element => {
  const trpc = useTRPC();
  const entryId = PARTICIPANT_BY_API_ID[player.apiId]?.entryId ?? 0;

  const { data: historyData } = useQuery({
    ...trpc.fpl.entryHistory.queryOptions({ entryId }),
    enabled: entryId > 0,
  });

  const { data: transactionsData } = useQuery(
    trpc.fpl.transactions.queryOptions({ leagueId: player.leagueId }),
  );

  const { data: choicesData } = useQuery(
    trpc.fpl.draftChoices.queryOptions({ leagueId: player.leagueId }),
  );

  const { data: bootstrap } = useQuery(trpc.fpl.bootstrapStatic.queryOptions());

  const elementMap = useMemo(
    () =>
      bootstrap
        ? new Map<number, FplElement>(bootstrap.elements.map((e) => [e.id, e]))
        : new Map<number, FplElement>(),
    [bootstrap],
  );

  const myTransactions = useMemo(() => {
    if (!transactionsData || !entryId) return [];
    return transactionsData.transactions.filter((t) => t.entry === entryId);
  }, [transactionsData, entryId]);

  const bestGameweek = useMemo(() => {
    if (!historyData?.history.length) return null;
    return Math.max(...historyData.history.map((h) => h.points));
  }, [historyData]);

  const worstGameweek = useMemo(() => {
    if (!historyData?.history.length) return null;
    return Math.min(...historyData.history.map((h) => h.points));
  }, [historyData]);

  const numberOfFreeTransfers = useMemo(() => {
    return myTransactions.filter((t) => t.kind === "f").length;
  }, [myTransactions]);

  const numberOfWaivers = useMemo(() => {
    return myTransactions.filter((t) => t.kind === "w").length;
  }, [myTransactions]);

  const waiverPercentage = useMemo(() => {
    const waivers = myTransactions.filter((t) => t.kind === "w");
    if (!waivers.length) return null;
    const accepted = waivers.filter((t) => t.result === "a").length;
    return Math.round((accepted / waivers.length) * 100);
  }, [myTransactions]);

  const loyaltyCount = useMemo(() => {
    if (!choicesData || !entryId) return null;
    const draftedElements = new Set(
      choicesData.choices
        .filter((c) => c.entry === entryId)
        .map((c) => c.element),
    );

    const currentElements = new Set(
      choicesData.element_status
        .filter((es) => es.owner === entryId)
        .map((es) => es.element),
    );

    const kept = [...draftedElements].filter((e) =>
      currentElements.has(e),
    ).length;
    return { kept, total: draftedElements.size };
  }, [choicesData, entryId]);

  const squadStats = useMemo(() => {
    if (!choicesData || !bootstrap || !entryId) return null;
    const currentSquad = choicesData.element_status
      .filter((es) => es.owner === entryId)
      .map((es) => elementMap.get(es.element))
      .filter((e): e is FplElement => e !== undefined);

    if (!currentSquad.length) return null;
    const sorted = [...currentSquad].sort(
      (a, b) => b.total_points - a.total_points,
    );

    const star = sorted[0];
    const worst = sorted[sorted.length - 1];
    if (!star || !worst) return null;
    return { star, worst };
  }, [choicesData, bootstrap, entryId, elementMap]);

  const draftDelta = useMemo(() => {
    if (!choicesData || !bootstrap || !entryId) return null;
    const initialElements = choicesData.choices
      .filter((c) => c.entry === entryId)
      .map((c) => elementMap.get(c.element))
      .filter((e): e is FplElement => e !== undefined);

    const currentElements = choicesData.element_status
      .filter((es) => es.owner === entryId)
      .map((es) => elementMap.get(es.element))
      .filter((e): e is FplElement => e !== undefined);

    if (!initialElements.length || !currentElements.length) return null;
    const initialTotal = initialElements.reduce(
      (sum, e) => sum + e.total_points,
      0,
    );

    const currentTotal = currentElements.reduce(
      (sum, e) => sum + e.total_points,
      0,
    );

    if (initialTotal === 0) return null;
    const percentage = ((currentTotal - initialTotal) / initialTotal) * 100;
    return { percentage, isPositive: percentage >= 0 };
  }, [choicesData, bootstrap, entryId, elementMap]);

  const draftDeltaValue =
    draftDelta !== null
      ? `${draftDelta.isPositive ? "+" : ""}${draftDelta.percentage.toFixed(1)}%`
      : "—";

  const draftDeltaClass =
    draftDelta !== null
      ? draftDelta.isPositive
        ? "text-green-400"
        : "text-red-400"
      : undefined;

  return (
    <React.Fragment>
      <div className="grid grid-cols-2 gap-2">
        <StatCell label="League" value={`#${player.leaguePosition}`} />
        <StatCell label="Overall" value={`#${player.overallPosition}`} />
        <StatCell
          label="Highest GW"
          value={bestGameweek !== null ? String(bestGameweek) : "—"}
        />
        <StatCell
          label="Lowest GW"
          value={worstGameweek !== null ? String(worstGameweek) : "—"}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <StatCell label="Waivers" value={String(numberOfWaivers)} />
        <StatCell
          label="Free Transfers"
          value={String(numberOfFreeTransfers)}
        />
        <StatCell
          label="Waiver %"
          value={waiverPercentage !== null ? `${waiverPercentage}%` : "—"}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <StatCell
          label="Net Gain"
          value={draftDeltaValue}
          valueClassName={draftDeltaClass}
        />
        <StatCell
          label="Loyalty"
          value={
            loyaltyCount !== null
              ? `${loyaltyCount.kept}/${loyaltyCount.total}`
              : "—"
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <StatCell
          label="Star Player"
          value={squadStats?.star.web_name ?? "—"}
        />
        <StatCell
          label="Weakest Player"
          value={squadStats?.worst.web_name ?? "—"}
        />
      </div>
    </React.Fragment>
  );
};

export default PlayerDetailsContent;
