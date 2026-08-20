import { PARTICIPANT_BY_ENTRY_ID } from "@pbd/lib/constants/participants"
import type { FplElement, FplTeam, LeagueEntry, Trade, Transaction } from "@pbd/types/fpl.types"

const ACCEPTED_TRANSACTION_RESULT = "a"

const PROCESSED_TRADE_STATE = "p"

const TRANSACTION_KIND_BY_CODE: Record<string, TransactionKind> = {
  w: "waiver",
  f: "freeAgent",
}

const MOVE_KIND_ORDER: TransactionKind[] = ["waiver", "freeAgent", "trade"]

const MOVE_KIND_NOUNS: Record<TransactionKind, { singular: string; plural: string }> = {
  waiver: { singular: "waiver", plural: "waivers" },
  freeAgent: { singular: "free agent", plural: "free agents" },
  trade: { singular: "trade", plural: "trades" },
}

export type TransactionKind = "waiver" | "freeAgent" | "trade"

export type MovePlayer = {
  name: string
  team: string
}

export type TransactionMove = {
  id: string
  kind: TransactionKind
  playerOut: MovePlayer | null
  playerIn: MovePlayer | null
  counterparty: string | null
}

export type ManagerMoves = {
  entryId: number
  managerName: string
  teamName: string
  image: string | null
  moves: TransactionMove[]
}

export type TransactionFeed = {
  gameweeks: number[]
  movesByGameweek: Map<number, ManagerMoves[]>
}

type FeedElement = Pick<FplElement, "id" | "web_name" | "team">

type FeedTeam = Pick<FplTeam, "id" | "short_name">

type FeedLeagueEntry = Pick<
  LeagueEntry,
  "entry_id" | "entry_name" | "player_first_name" | "player_last_name"
>

type BuildTransactionFeedArgs = {
  transactions: Transaction[]
  trades: Trade[]
  elements: FeedElement[]
  teams: FeedTeam[]
  leagueEntries: FeedLeagueEntry[]
}

type Manager = {
  managerName: string
  teamName: string
  image: string | null
}

type FeedMove = TransactionMove & {
  entryId: number
  event: number
  occurredAt: string
}

const buildPlayerLookup = (elements: FeedElement[], teams: FeedTeam[]): Map<number, MovePlayer> => {
  const teamNames = new Map(teams.map((team) => [team.id, team.short_name]))

  return new Map(
    elements.map((element) => [
      element.id,
      { name: element.web_name, team: teamNames.get(element.team) ?? "" },
    ]),
  )
}

const resolvePlayer = (players: Map<number, MovePlayer>, elementId: number): MovePlayer | null => {
  if (elementId <= 0) return null
  return players.get(elementId) ?? { name: `#${elementId}`, team: "" }
}

const buildManagerLookup = (leagueEntries: FeedLeagueEntry[]): Map<number, Manager> =>
  new Map(
    leagueEntries.map((entry) => {
      const participant = PARTICIPANT_BY_ENTRY_ID[entry.entry_id]

      return [
        entry.entry_id,
        {
          managerName:
            participant?.nickname ??
            participant?.name ??
            `${entry.player_first_name} ${entry.player_last_name}`,
          teamName: entry.entry_name,
          image: participant?.image ?? null,
        },
      ]
    }),
  )

const resolveManager = (managers: Map<number, Manager>, entryId: number): Manager => {
  const known = managers.get(entryId)
  if (known) return known

  const participant = PARTICIPANT_BY_ENTRY_ID[entryId]

  return {
    managerName: participant?.nickname ?? participant?.name ?? `Entry ${entryId}`,
    teamName: "",
    image: participant?.image ?? null,
  }
}

const buildTransactionMoves = (
  transactions: Transaction[],
  players: Map<number, MovePlayer>,
): FeedMove[] =>
  transactions
    .filter((transaction) => transaction.result === ACCEPTED_TRANSACTION_RESULT)
    .flatMap((transaction) => {
      const kind = TRANSACTION_KIND_BY_CODE[transaction.kind]
      if (!kind) return []

      return [
        {
          id: `transaction-${transaction.id}`,
          kind,
          entryId: transaction.entry,
          event: transaction.event,
          occurredAt: transaction.added,
          playerOut: resolvePlayer(players, transaction.element_out),
          playerIn: resolvePlayer(players, transaction.element_in),
          counterparty: null,
        },
      ]
    })

const buildTradeMoves = (
  trades: Trade[],
  players: Map<number, MovePlayer>,
  managers: Map<number, Manager>,
): FeedMove[] =>
  trades
    .filter((trade) => trade.state === PROCESSED_TRADE_STATE)
    .flatMap((trade) =>
      trade.tradeitem_set.flatMap((item, index): FeedMove[] => [
        {
          id: `trade-${trade.id}-${index}-offered`,
          kind: "trade",
          entryId: trade.offered_entry,
          event: trade.event,
          occurredAt: trade.response_time,
          playerOut: resolvePlayer(players, item.element_out),
          playerIn: resolvePlayer(players, item.element_in),
          counterparty: resolveManager(managers, trade.received_entry).managerName,
        },
        {
          id: `trade-${trade.id}-${index}-received`,
          kind: "trade",
          entryId: trade.received_entry,
          event: trade.event,
          occurredAt: trade.response_time,
          playerOut: resolvePlayer(players, item.element_in),
          playerIn: resolvePlayer(players, item.element_out),
          counterparty: resolveManager(managers, trade.offered_entry).managerName,
        },
      ]),
    )

const toMove = ({ id, kind, playerOut, playerIn, counterparty }: FeedMove): TransactionMove => ({
  id,
  kind,
  playerOut,
  playerIn,
  counterparty,
})

const groupByManager = (moves: FeedMove[], managers: Map<number, Manager>): ManagerMoves[] => {
  const movesByEntry = new Map<number, FeedMove[]>()
  for (const move of moves) {
    const existing = movesByEntry.get(move.entryId)
    if (existing) existing.push(move)
    else movesByEntry.set(move.entryId, [move])
  }

  return [...movesByEntry.entries()]
    .map(([entryId, entryMoves]) => ({
      entryId,
      ...resolveManager(managers, entryId),
      moves: [...entryMoves]
        .sort((first, second) => first.occurredAt.localeCompare(second.occurredAt))
        .map(toMove),
    }))
    .sort(
      (first, second) =>
        second.moves.length - first.moves.length ||
        first.managerName.localeCompare(second.managerName),
    )
}

export const buildTransactionFeed = ({
  transactions,
  trades,
  elements,
  teams,
  leagueEntries,
}: BuildTransactionFeedArgs): TransactionFeed => {
  const players = buildPlayerLookup(elements, teams)
  const managers = buildManagerLookup(leagueEntries)

  const moves = [
    ...buildTransactionMoves(transactions, players),
    ...buildTradeMoves(trades, players, managers),
  ]

  const movesByGameweek = new Map<number, ManagerMoves[]>()
  for (const event of new Set(moves.map((move) => move.event))) {
    movesByGameweek.set(
      event,
      groupByManager(
        moves.filter((move) => move.event === event),
        managers,
      ),
    )
  }

  return {
    gameweeks: [...movesByGameweek.keys()].sort((first, second) => second - first),
    movesByGameweek,
  }
}

export const summariseMoves = (moves: TransactionMove[]): string =>
  MOVE_KIND_ORDER.map((kind) => ({
    kind,
    count: moves.filter((move) => move.kind === kind).length,
  }))
    .filter(({ count }) => count > 0)
    .map(({ kind, count }) => {
      const noun = MOVE_KIND_NOUNS[kind]
      return `${count} ${count === 1 ? noun.singular : noun.plural}`
    })
    .join(" · ")
