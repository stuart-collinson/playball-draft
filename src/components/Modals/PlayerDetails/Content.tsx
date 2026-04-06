"use client";

import React from "react";
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants";
import { useTRPC } from "@pbd/trpc/react";
import type { FplElement } from "@pbd/types/fpl.types";
import type { PlayerDialogData } from "@pbd/types/player.types";
import { useQueries, useQuery } from "@tanstack/react-query";
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

  // All transactions for this manager only
  const myTransactions = useMemo(() => {
    if (!transactionsData || !entryId) return [];
    return transactionsData.transactions.filter((t) => t.entry === entryId);
  }, [transactionsData, entryId]);

  // Unique elements this manager acquired via accepted waivers
  const myWaiverElementIds = useMemo(
    () => [
      ...new Set(
        myTransactions
          .filter((t) => t.kind === "w" && t.result === "a")
          .map((t) => t.element_in),
      ),
    ],
    [myTransactions],
  );

  // Fetch element summaries for each waivered player in parallel.
  // All upstream data (transactions, bootstrap) is already in the React Query
  // cache from server prefetch, so we only pay for element-summary fetches.
  const elementSummaryResults = useQueries({
    queries: myWaiverElementIds.map((elementId) =>
      trpc.fpl.elementSummary.queryOptions({ elementId }),
    ),
  });

  const bestGameweek = useMemo(() => {
    if (!historyData?.history.length) return null;
    return Math.max(...historyData.history.map((h) => h.points));
  }, [historyData]);

  const worstGameweek = useMemo(() => {
    if (!historyData?.history.length) return null;
    return Math.min(...historyData.history.map((h) => h.points));
  }, [historyData]);

  const numberOfFreeTransfers = useMemo(
    () => myTransactions.filter((t) => t.kind === "f").length,
    [myTransactions],
  );

  const numberOfWaivers = useMemo(
    () => myTransactions.filter((t) => t.kind === "w").length,
    [myTransactions],
  );

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

  const starPlayer = useMemo(() => {
    if (!choicesData || !bootstrap || !entryId) return null;
    const currentSquad = choicesData.element_status
      .filter((es) => es.owner === entryId)
      .map((es) => elementMap.get(es.element))
      .filter((e): e is FplElement => e !== undefined);
    if (!currentSquad.length) return null;
    return (
      [...currentSquad].sort((a, b) => b.total_points - a.total_points)[0] ??
      null
    );
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

  // Compute best waiver using ownership-period points.
  // Waits for all element summaries to resolve before returning a value so
  // the display transitions once from "—" to the final answer rather than
  // flickering through intermediate results.
  const bestWaiver = useMemo(() => {
    if (!bootstrap || !myWaiverElementIds.length) return null;
    if (elementSummaryResults.some((q) => q.isPending)) return null;

    const finishedGwSet = new Set(
      bootstrap.events.data.filter((e) => e.finished).map((e) => e.id),
    );
    const currentEvent = bootstrap.events.current;

    const elementGwPoints = new Map<number, Map<number, number>>();
    myWaiverElementIds.forEach((elementId, i) => {
      const data = elementSummaryResults[i]?.data;
      if (!data) return;
      const gwMap = new Map<number, number>();
      data.history.forEach((h) => gwMap.set(h.event, h.total_points));
      elementGwPoints.set(elementId, gwMap);
    });

    const acceptedWaivers = myTransactions.filter(
      (t) => t.kind === "w" && t.result === "a",
    );

    const scored = acceptedWaivers.map((waiver) => {
      // Find first transaction after acquisition where this player left this entry
      const dropTx = myTransactions
        .filter(
          (t) => t.element_out === waiver.element_in && t.event > waiver.event,
        )
        .sort((a, b) => a.event - b.event)[0];

      const startGw = waiver.event;
      const endGw = dropTx ? dropTx.event - 1 : currentEvent;

      const gwPoints = elementGwPoints.get(waiver.element_in);
      let points = 0;
      for (let gw = startGw; gw <= endGw; gw++) {
        if (finishedGwSet.has(gw)) points += gwPoints?.get(gw) ?? 0;
      }

      return {
        playerName:
          elementMap.get(waiver.element_in)?.web_name ??
          `#${waiver.element_in}`,
        points,
      };
    });

    return scored.sort((a, b) => b.points - a.points)[0] ?? null;
  }, [
    bootstrap,
    myTransactions,
    myWaiverElementIds,
    elementSummaryResults,
    elementMap,
  ]);

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
          valueClassName="text-yellow-400"
        />
        <StatCell
          label="Lowest GW"
          value={worstGameweek !== null ? String(worstGameweek) : "—"}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <StatCell label="Waivers" value={String(numberOfWaivers)} />
        <StatCell label="Free Agents" value={String(numberOfFreeTransfers)} />
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
        <StatCell label="Star Player" value={starPlayer?.web_name ?? "—"} />
        <StatCell
          label="Best Waiver"
          value={
            bestWaiver
              ? `${bestWaiver.playerName} · ${bestWaiver.points} pts`
              : "—"
          }
        />
      </div>
    </React.Fragment>
  );
};

export default PlayerDetailsContent;
