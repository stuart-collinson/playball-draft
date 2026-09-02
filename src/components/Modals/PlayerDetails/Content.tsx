"use client"

import { useElementSummaries } from "@pbd/hooks/fpl/useElementSummaries"
import { usePlayerDetailsData } from "@pbd/hooks/fpl/usePlayerDetailsData"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/participants"
import { buildTradeDrops, findOwnershipEnd } from "@pbd/lib/fpl/ownership"
import type { FplElement } from "@pbd/types/fpl.types"
import type { PlayerDialogData } from "@pbd/types/player.types"
import React from "react"
import type { JSX } from "react"
import { useMemo } from "react"
import { StatCell } from "../StatCell"

type Props = {
  player: PlayerDialogData
}

const PlayerDetailsContent = ({ player }: Props): JSX.Element => {
  const entryId = PARTICIPANT_BY_API_ID[player.apiId]?.entryId ?? 0

  const {
    history: { data: historyData },
    transactions: { data: transactionsData },
    trades: { data: tradesData },
    choices: { data: choicesData },
    bootstrap: { data: bootstrap },
  } = usePlayerDetailsData(player.leagueId, entryId)

  const elementMap = useMemo(
    () =>
      bootstrap
        ? new Map<number, FplElement>(bootstrap.elements.map((e) => [e.id, e]))
        : new Map<number, FplElement>(),
    [bootstrap],
  )

  const myTransactions = useMemo(() => {
    if (!transactionsData || !entryId) return []
    return transactionsData.transactions.filter((t) => t.entry === entryId)
  }, [transactionsData, entryId])

  const myTrades = useMemo(() => {
    if (!tradesData || !entryId) return []
    return tradesData.trades.filter(
      (t) => t.offered_entry === entryId || t.received_entry === entryId,
    )
  }, [tradesData, entryId])

  const myPickupElementIds = useMemo(
    () => [
      ...new Set(
        myTransactions
          .filter((t) => (t.kind === "w" || t.kind === "f") && t.result === "a")
          .map((t) => t.element_in),
      ),
    ],
    [myTransactions],
  )

  const { data: summariesById } = useElementSummaries(myPickupElementIds)

  const bestGameweek = useMemo(() => {
    if (!historyData?.history.length) return null
    return Math.max(...historyData.history.map((h) => h.points))
  }, [historyData])

  const worstGameweek = useMemo(() => {
    if (!historyData?.history.length) return null
    return Math.min(...historyData.history.map((h) => h.points))
  }, [historyData])

  const numberOfFreeTransfers = useMemo(
    () => myTransactions.filter((t) => t.kind === "f" && t.result === "a").length,
    [myTransactions],
  )

  const numberOfWaivers = useMemo(
    () => myTransactions.filter((t) => t.kind === "w" && t.result === "a").length,
    [myTransactions],
  )

  const numberOfTrades = myTrades.length

  const waiverPercentage = useMemo(() => {
    const waivers = myTransactions.filter((t) => t.kind === "w")
    if (!waivers.length) return null
    const accepted = waivers.filter((t) => t.result === "a").length
    return Math.round((accepted / waivers.length) * 100)
  }, [myTransactions])

  const loyaltyCount = useMemo(() => {
    if (!choicesData || !entryId) return null
    const draftedElements = new Set(
      choicesData.choices.filter((c) => c.entry === entryId).map((c) => c.element),
    )
    const currentElements = new Set(
      choicesData.element_status.filter((es) => es.owner === entryId).map((es) => es.element),
    )
    const kept = [...draftedElements].filter((e) => currentElements.has(e)).length
    return { kept, total: draftedElements.size }
  }, [choicesData, entryId])

  const starPlayer = useMemo(() => {
    if (!choicesData || !bootstrap || !entryId) return null
    const currentSquad = choicesData.element_status
      .filter((es) => es.owner === entryId)
      .map((es) => elementMap.get(es.element))
      .filter((e): e is FplElement => e !== undefined)
    if (!currentSquad.length) return null
    return [...currentSquad].sort((a, b) => b.total_points - a.total_points)[0] ?? null
  }, [choicesData, bootstrap, entryId, elementMap])

  const draftDelta = useMemo(() => {
    if (!choicesData || !bootstrap || !entryId) return null
    const initialElements = choicesData.choices
      .filter((c) => c.entry === entryId)
      .map((c) => elementMap.get(c.element))
      .filter((e): e is FplElement => e !== undefined)
    const currentElements = choicesData.element_status
      .filter((es) => es.owner === entryId)
      .map((es) => elementMap.get(es.element))
      .filter((e): e is FplElement => e !== undefined)
    if (!initialElements.length || !currentElements.length) return null
    const initialTotal = initialElements.reduce((sum, e) => sum + e.total_points, 0)
    const currentTotal = currentElements.reduce((sum, e) => sum + e.total_points, 0)
    if (initialTotal === 0) return null
    const percentage = ((currentTotal - initialTotal) / initialTotal) * 100
    return { percentage, isPositive: percentage >= 0 }
  }, [choicesData, bootstrap, entryId, elementMap])

  const bestPickup = useMemo(() => {
    if (!bootstrap || !myPickupElementIds.length || !summariesById) return null

    const finishedGwSet = new Set(bootstrap.events.data.filter((e) => e.finished).map((e) => e.id))
    const currentEvent = bootstrap.events.current ?? 0

    const myTradeDrops = buildTradeDrops(myTrades)

    const acceptedPickups = myTransactions.filter(
      (t) => (t.kind === "w" || t.kind === "f") && t.result === "a",
    )

    const scored = acceptedPickups.map((pickup) => {
      const startGw = pickup.event
      const endGw = findOwnershipEnd(
        pickup.element_in,
        entryId,
        startGw,
        myTransactions,
        myTradeDrops,
        currentEvent,
      )

      const history = summariesById[pickup.element_in]?.history ?? []
      const gwPoints = new Map(history.map((h) => [h.event, h.total_points]))

      let points = 0
      for (let gw = startGw; gw <= endGw; gw++) {
        if (finishedGwSet.has(gw)) points += gwPoints.get(gw) ?? 0
      }

      return {
        playerName: elementMap.get(pickup.element_in)?.web_name ?? `#${pickup.element_in}`,
        points,
      }
    })

    return scored.sort((a, b) => b.points - a.points)[0] ?? null
  }, [bootstrap, myTransactions, myTrades, myPickupElementIds, summariesById, elementMap, entryId])

  const draftDeltaValue =
    draftDelta !== null
      ? `${draftDelta.isPositive ? "+" : ""}${draftDelta.percentage.toFixed(1)}%`
      : "—"

  const draftDeltaClass =
    draftDelta !== null ? (draftDelta.isPositive ? "text-green-400" : "text-red-400") : undefined

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
        <StatCell label="Lowest GW" value={worstGameweek !== null ? String(worstGameweek) : "—"} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <StatCell label="Waivers" value={String(numberOfWaivers)} />
        <StatCell label="Free Agents" value={String(numberOfFreeTransfers)} />
        <StatCell label="Trades" value={String(numberOfTrades)} />
        <StatCell
          label="Waiver %"
          value={waiverPercentage !== null ? `${waiverPercentage}%` : "—"}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <StatCell label="Net Gain" value={draftDeltaValue} valueClassName={draftDeltaClass} />
        <StatCell
          label="Loyalty"
          value={loyaltyCount !== null ? `${loyaltyCount.kept}/${loyaltyCount.total}` : "—"}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <StatCell label="Star Player" value={starPlayer?.web_name ?? "—"} />
        <StatCell
          label="Best Pickup"
          value={bestPickup ? `${bestPickup.playerName} · ${bestPickup.points}` : "—"}
        />
      </div>
    </React.Fragment>
  )
}

export default PlayerDetailsContent
