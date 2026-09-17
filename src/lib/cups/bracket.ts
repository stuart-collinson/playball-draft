import { CUP_ROUNDS, CUP_ROUND_TIE_COUNTS } from "@pbd/lib/constants/Cups"
import { seededCoinFlip } from "@pbd/lib/cups/draw"
import { cupRoundGameweeks, cupTieKey, nextCupRound, previousCupRound } from "@pbd/lib/cups/rounds"
import type {
  CupFinalResult,
  CupFormat,
  CupRound,
  CupSchedule,
  CupStatus,
  CupTie,
  CupTieLeg,
  CupTieRow,
  CupTieStatus,
} from "@pbd/types/cups.types"

export type CupDrawSlot = {
  round: CupRound
  position: number
  personOne: string | null
  personTwo: string | null
}

export type CupFoldContext = {
  format: CupFormat
  schedule: CupSchedule
  drawSeed: string
  finishedGameweeks: readonly number[]
  currentGameweek: number | null
  pointsFor: (person: string, gameweek: number) => number | null
  goalsFor: (person: string, gameweek: number) => number
  seasonPointsFor: (person: string, gameweek: number) => number | null
}

export type CupBakeRow = {
  id: string
  personOne: string | null
  personTwo: string | null
  personOneLegOne: number | null
  personTwoLegOne: number | null
  personOneLegTwo: number | null
  personTwoLegTwo: number | null
  winner: string | null
}

type WorkingTie = {
  row: CupTieRow
  personOne: string | null
  personTwo: string | null
}

type StoredLeg = {
  one: number | null
  two: number | null
}

const FIRST_LEG = 0

const SECOND_LEG = 1

export const buildCupSlots = (shuffled: readonly string[]): CupDrawSlot[] =>
  CUP_ROUNDS.flatMap((round) =>
    Array.from({ length: CUP_ROUND_TIE_COUNTS[round] }, (_, position) => ({
      round,
      position,
      personOne: round === "round_of_16" ? (shuffled[position * 2] ?? null) : null,
      personTwo: round === "round_of_16" ? (shuffled[position * 2 + 1] ?? null) : null,
    })),
  )

const storedLeg = (row: CupTieRow, legIndex: number): StoredLeg =>
  legIndex === FIRST_LEG
    ? { one: row.personOneLegOne, two: row.personTwoLegOne }
    : { one: row.personOneLegTwo, two: row.personTwoLegTwo }

const legValue = (
  stored: number | null,
  person: string | null,
  gameweek: number,
  pointsFor: CupFoldContext["pointsFor"],
): number | null => {
  if (stored !== null) return stored
  if (person === null) return null

  return pointsFor(person, gameweek)
}

const buildLegs = (slot: WorkingTie, gameweeks: number[], context: CupFoldContext): CupTieLeg[] =>
  gameweeks.map((gameweek, legIndex) => {
    const stored = storedLeg(slot.row, legIndex)

    return {
      gameweek,
      personOne: legValue(stored.one, slot.personOne, gameweek, context.pointsFor),
      personTwo: legValue(stored.two, slot.personTwo, gameweek, context.pointsFor),
    }
  })

const aggregateFor = (legs: CupTieLeg[], side: "personOne" | "personTwo"): number | null => {
  const values = legs.map((leg) => leg[side]).filter((value): value is number => value !== null)
  if (values.length === 0) return null

  return values.reduce((total, value) => total + value, 0)
}

const allLegsSettled = (legs: CupTieLeg[], finished: Set<number>): boolean =>
  legs.every(
    (leg) => finished.has(leg.gameweek) && leg.personOne !== null && leg.personTwo !== null,
  )

const decideWinner = (
  tieId: string,
  personOne: string,
  personTwo: string,
  legs: CupTieLeg[],
  context: CupFoldContext,
): string => {
  const aggregateOne = aggregateFor(legs, "personOne") ?? 0
  const aggregateTwo = aggregateFor(legs, "personTwo") ?? 0
  if (aggregateOne !== aggregateTwo) return aggregateOne > aggregateTwo ? personOne : personTwo

  const gameweeks = legs.map((leg) => leg.gameweek)
  const totalGoals = (person: string): number =>
    gameweeks.reduce((total, gameweek) => total + context.goalsFor(person, gameweek), 0)

  const goalsOne = totalGoals(personOne)
  const goalsTwo = totalGoals(personTwo)
  if (goalsOne !== goalsTwo) return goalsOne > goalsTwo ? personOne : personTwo

  const lastGameweek = gameweeks[gameweeks.length - 1] ?? 0
  const seasonOne = context.seasonPointsFor(personOne, lastGameweek) ?? 0
  const seasonTwo = context.seasonPointsFor(personTwo, lastGameweek) ?? 0
  if (seasonOne !== seasonTwo) return seasonOne > seasonTwo ? personOne : personTwo

  return seededCoinFlip(context.drawSeed, tieId) === 0 ? personOne : personTwo
}

const resolveWinner = (
  slot: WorkingTie,
  legs: CupTieLeg[],
  isSettled: boolean,
  context: CupFoldContext,
): string | null => {
  if (slot.row.winner !== null) return slot.row.winner
  if (!isSettled) return null
  if (slot.personOne === null || slot.personTwo === null) return null

  return decideWinner(slot.row.id, slot.personOne, slot.personTwo, legs, context)
}

const tieStatus = (
  slot: WorkingTie,
  isSettled: boolean,
  gameweeks: number[],
  currentGameweek: number | null,
): CupTieStatus => {
  if (slot.personOne === null || slot.personTwo === null) return "pending"
  if (isSettled) return "settled"

  const first = gameweeks[0]
  if (currentGameweek !== null && first !== undefined && first <= currentGameweek) return "live"

  return "scheduled"
}

const feederNames = (
  round: CupRound,
  position: number,
  side: number,
  working: Map<string, WorkingTie>,
): string[] => {
  const earlier = previousCupRound(round)
  if (earlier === null) return []

  const feeder = working.get(cupTieKey(earlier, position * 2 + side))
  if (!feeder || feeder.personOne === null || feeder.personTwo === null) return []

  return [feeder.personOne, feeder.personTwo]
}

const promoteWinner = (tie: CupTie, working: Map<string, WorkingTie>): void => {
  if (tie.winner === null) return

  const later = nextCupRound(tie.round)
  if (later === null) return

  const target = working.get(cupTieKey(later, Math.floor(tie.position / 2)))
  if (!target) return

  if (tie.position % 2 === 0) target.personOne = tie.winner
  else target.personTwo = tie.winner
}

export const foldCupTies = (rows: readonly CupTieRow[], context: CupFoldContext): CupTie[] => {
  const working = new Map<string, WorkingTie>(
    rows.map((row) => [
      cupTieKey(row.round, row.position),
      { row, personOne: row.personOne, personTwo: row.personTwo },
    ]),
  )
  const finished = new Set(context.finishedGameweeks)
  const resolved: CupTie[] = []

  for (const round of CUP_ROUNDS) {
    const gameweeks = cupRoundGameweeks(context.format, context.schedule, round)

    for (let position = 0; position < CUP_ROUND_TIE_COUNTS[round]; position += 1) {
      const slot = working.get(cupTieKey(round, position))
      if (!slot) continue

      const legs = buildLegs(slot, gameweeks, context)
      const isSettled =
        slot.row.winner !== null ||
        (slot.personOne !== null && slot.personTwo !== null && allLegsSettled(legs, finished))

      const tie: CupTie = {
        id: slot.row.id,
        round,
        position,
        personOne: slot.personOne,
        personTwo: slot.personTwo,
        feederOne: feederNames(round, position, FIRST_LEG, working),
        feederTwo: feederNames(round, position, SECOND_LEG, working),
        legs,
        aggregateOne: aggregateFor(legs, "personOne"),
        aggregateTwo: aggregateFor(legs, "personTwo"),
        winner: resolveWinner(slot, legs, isSettled, context),
        status: tieStatus(slot, isSettled, gameweeks, context.currentGameweek),
      }

      resolved.push(tie)
      promoteWinner(tie, working)
    }
  }

  return resolved
}

export const levelTieGameweeks = (ties: readonly CupTie[]): number[] => {
  const gameweeks = ties.flatMap((tie) => {
    if (tie.status !== "settled") return []
    if (tie.aggregateOne === null || tie.aggregateTwo === null) return []
    if (tie.aggregateOne !== tie.aggregateTwo) return []

    return tie.legs.map((leg) => leg.gameweek)
  })

  return [...new Set(gameweeks)].sort((first, second) => first - second)
}

const hasNewValue = (stored: CupTieRow, candidate: CupBakeRow): boolean =>
  (candidate.personOne !== null && stored.personOne === null) ||
  (candidate.personTwo !== null && stored.personTwo === null) ||
  (candidate.personOneLegOne !== null && stored.personOneLegOne === null) ||
  (candidate.personTwoLegOne !== null && stored.personTwoLegOne === null) ||
  (candidate.personOneLegTwo !== null && stored.personOneLegTwo === null) ||
  (candidate.personTwoLegTwo !== null && stored.personTwoLegTwo === null) ||
  (candidate.winner !== null && stored.winner === null)

export const cupBakeRows = (rows: readonly CupTieRow[], ties: readonly CupTie[]): CupBakeRow[] => {
  const storedById = new Map(rows.map((row) => [row.id, row]))

  return ties.flatMap((tie) => {
    const stored = storedById.get(tie.id)
    if (!stored || stored.winner !== null) return []

    const isSettled = tie.status === "settled"
    const candidate: CupBakeRow = {
      id: tie.id,
      personOne: tie.personOne,
      personTwo: tie.personTwo,
      personOneLegOne: isSettled ? (tie.legs[FIRST_LEG]?.personOne ?? null) : null,
      personTwoLegOne: isSettled ? (tie.legs[FIRST_LEG]?.personTwo ?? null) : null,
      personOneLegTwo: isSettled ? (tie.legs[SECOND_LEG]?.personOne ?? null) : null,
      personTwoLegTwo: isSettled ? (tie.legs[SECOND_LEG]?.personTwo ?? null) : null,
      winner: isSettled ? tie.winner : null,
    }

    return hasNewValue(stored, candidate) ? [candidate] : []
  })
}

export const cupStatusFor = (ties: readonly CupTie[], isCurrentSeason: boolean): CupStatus => {
  const final = ties.find((tie) => tie.round === "final")
  if (final?.winner) return "finished"

  return isCurrentSeason ? "running" : "unfinished"
}

export const currentCupRound = (ties: readonly CupTie[]): CupRound | null =>
  CUP_ROUNDS.find((round) => ties.some((tie) => tie.round === round && tie.status !== "settled")) ??
  null

export const cupFinalResult = (ties: readonly CupTie[]): CupFinalResult | null => {
  const final = ties.find((tie) => tie.round === "final")
  if (!final?.winner || final.personOne === null || final.personTwo === null) return null

  const winnerIsOne = final.winner === final.personOne

  return {
    winner: final.winner,
    loser: winnerIsOne ? final.personTwo : final.personOne,
    winnerPoints: (winnerIsOne ? final.aggregateOne : final.aggregateTwo) ?? 0,
    loserPoints: (winnerIsOne ? final.aggregateTwo : final.aggregateOne) ?? 0,
  }
}
