import { CUP_TIE_COUNT } from "@pbd/lib/constants/Cups"
import {
  buildCupSlots,
  cupBakeRows,
  cupFinalResult,
  cupStatusFor,
  currentCupRound,
  foldCupTies,
  levelTieGameweeks,
} from "@pbd/lib/cups/bracket"
import type { CupFoldContext } from "@pbd/lib/cups/bracket"
import type { CupSchedule, CupTie, CupTieRow } from "@pbd/types/cups.types"
import { describe, expect, it } from "vitest"

const SEED = "a".repeat(64)

const ENTRANTS = "abcdefghijklmnop".split("")

const KNOCKOUT_SCHEDULE: CupSchedule = {
  round_of_16: 10,
  quarter_final: 11,
  semi_final: 12,
  final: 13,
}

const TWO_LEG_SCHEDULE: CupSchedule = {
  round_of_16: 10,
  quarter_final: 12,
  semi_final: 14,
  final: 16,
}

const KNOCKOUT_GAMEWEEKS = [10, 11, 12, 13]

const TWO_LEG_GAMEWEEKS = [10, 11, 12, 13, 14, 15, 16]

const ALPHABETICAL_POINTS: Record<string, number> = Object.fromEntries(
  ENTRANTS.map((letter, index) => [letter, 100 - index]),
)

const buildRows = (overrides: Record<string, Partial<CupTieRow>> = {}): CupTieRow[] =>
  buildCupSlots(ENTRANTS).map((slot) => {
    const id = `${slot.round}-${slot.position}`

    return {
      id,
      round: slot.round,
      position: slot.position,
      personOne: slot.personOne,
      personTwo: slot.personTwo,
      personOneLegOne: null,
      personTwoLegOne: null,
      personOneLegTwo: null,
      personTwoLegTwo: null,
      winner: null,
      ...overrides[id],
    }
  })

const context = (overrides: Partial<CupFoldContext> = {}): CupFoldContext => ({
  format: "knockout",
  schedule: KNOCKOUT_SCHEDULE,
  drawSeed: SEED,
  finishedGameweeks: [],
  currentGameweek: null,
  pointsFor: (person) => ALPHABETICAL_POINTS[person] ?? null,
  goalsFor: () => 0,
  seasonPointsFor: () => null,
  ...overrides,
})

const tieAt = (ties: CupTie[], id: string): CupTie => {
  const tie = ties.find((candidate) => candidate.id === id)
  if (!tie) throw new Error(`No tie ${id}`)

  return tie
}

describe("buildCupSlots", () => {
  it("creates fifteen slots across the four rounds", () => {
    const slots = buildCupSlots(ENTRANTS)

    expect(slots).toHaveLength(CUP_TIE_COUNT)
    expect(slots.filter((slot) => slot.round === "round_of_16")).toHaveLength(8)
    expect(slots.filter((slot) => slot.round === "quarter_final")).toHaveLength(4)
    expect(slots.filter((slot) => slot.round === "semi_final")).toHaveLength(2)
    expect(slots.filter((slot) => slot.round === "final")).toHaveLength(1)
  })

  it("pairs the shuffled entrants off in order for the round of sixteen", () => {
    const slots = buildCupSlots(ENTRANTS)

    expect(slots[0]).toMatchObject({ personOne: "a", personTwo: "b" })
    expect(slots[7]).toMatchObject({ personOne: "o", personTwo: "p" })
  })

  it("leaves every later round without participants", () => {
    const slots = buildCupSlots(ENTRANTS)
    const later = slots.filter((slot) => slot.round !== "round_of_16")

    expect(later.every((slot) => slot.personOne === null && slot.personTwo === null)).toBe(true)
  })
})

describe("foldCupTies", () => {
  it("leaves every tie unsettled when no gameweek has finished", () => {
    const ties = foldCupTies(buildRows(), context())

    expect(tieAt(ties, "round_of_16-0").status).toBe("scheduled")
    expect(tieAt(ties, "quarter_final-0").status).toBe("pending")
    expect(ties.every((tie) => tie.winner === null)).toBe(true)
  })

  it("marks a tie live once its gameweek is the current one", () => {
    const ties = foldCupTies(buildRows(), context({ currentGameweek: 10 }))

    expect(tieAt(ties, "round_of_16-0").status).toBe("live")
    expect(tieAt(ties, "round_of_16-0").aggregateOne).toBe(100)
  })

  it("settles the round of sixteen once its gameweek has finished", () => {
    const ties = foldCupTies(buildRows(), context({ finishedGameweeks: [10] }))

    expect(tieAt(ties, "round_of_16-0").status).toBe("settled")
    expect(tieAt(ties, "round_of_16-0").winner).toBe("a")
    expect(tieAt(ties, "round_of_16-7").winner).toBe("o")
  })

  it("promotes an even position into the first side of the next tie", () => {
    const ties = foldCupTies(buildRows(), context({ finishedGameweeks: [10] }))

    expect(tieAt(ties, "quarter_final-0").personOne).toBe("a")
  })

  it("promotes an odd position into the second side of the next tie", () => {
    const ties = foldCupTies(buildRows(), context({ finishedGameweeks: [10] }))

    expect(tieAt(ties, "quarter_final-0").personTwo).toBe("c")
  })

  it("carries winners all the way to the final when every gameweek has finished", () => {
    const ties = foldCupTies(buildRows(), context({ finishedGameweeks: KNOCKOUT_GAMEWEEKS }))

    expect(tieAt(ties, "semi_final-0")).toMatchObject({ personOne: "a", personTwo: "e" })
    expect(tieAt(ties, "final-0")).toMatchObject({ personOne: "a", personTwo: "i", winner: "a" })
  })

  it("names both possible opponents on a tie whose feeders are known", () => {
    const ties = foldCupTies(buildRows(), context())

    expect(tieAt(ties, "quarter_final-0").feederOne).toEqual(["a", "b"])
    expect(tieAt(ties, "quarter_final-0").feederTwo).toEqual(["c", "d"])
  })

  it("leaves feeders empty when the feeding tie has no participants yet", () => {
    const ties = foldCupTies(buildRows(), context())

    expect(tieAt(ties, "semi_final-0").feederOne).toEqual([])
  })

  it("adds both legs together on a two-legged tie", () => {
    const ties = foldCupTies(
      buildRows(),
      context({
        format: "two_legs",
        schedule: TWO_LEG_SCHEDULE,
        finishedGameweeks: [10, 11],
        pointsFor: (person, gameweek) => (gameweek === 10 ? 40 : person === "a" ? 30 : 10),
      }),
    )

    expect(tieAt(ties, "round_of_16-0").aggregateOne).toBe(70)
    expect(tieAt(ties, "round_of_16-0").aggregateTwo).toBe(50)
    expect(tieAt(ties, "round_of_16-0").winner).toBe("a")
  })

  it("stays unsettled while only the first leg has finished", () => {
    const ties = foldCupTies(
      buildRows(),
      context({
        format: "two_legs",
        schedule: TWO_LEG_SCHEDULE,
        finishedGameweeks: [10],
        currentGameweek: 11,
      }),
    )

    expect(tieAt(ties, "round_of_16-0").status).toBe("live")
    expect(tieAt(ties, "round_of_16-0").winner).toBeNull()
  })

  it("stays unsettled when a participant has no points row for a leg", () => {
    const ties = foldCupTies(
      buildRows(),
      context({
        finishedGameweeks: [10],
        pointsFor: (person) => (person === "b" ? null : 50),
        currentGameweek: 10,
      }),
    )

    expect(tieAt(ties, "round_of_16-0").status).toBe("live")
    expect(tieAt(ties, "round_of_16-0").winner).toBeNull()
  })

  it("breaks a level tie on starter goals", () => {
    const ties = foldCupTies(
      buildRows(),
      context({
        finishedGameweeks: [10],
        pointsFor: () => 60,
        goalsFor: (person) => (person === "b" ? 3 : 1),
      }),
    )

    expect(tieAt(ties, "round_of_16-0").winner).toBe("b")
  })

  it("falls to season points when aggregate and goals are both level", () => {
    const ties = foldCupTies(
      buildRows(),
      context({
        finishedGameweeks: [10],
        pointsFor: () => 60,
        goalsFor: () => 2,
        seasonPointsFor: (person) => (person === "b" ? 900 : 800),
      }),
    )

    expect(tieAt(ties, "round_of_16-0").winner).toBe("b")
  })

  it("falls to the seeded coin flip when everything else is level", () => {
    const levelContext = context({
      finishedGameweeks: [10],
      pointsFor: () => 60,
      goalsFor: () => 2,
      seasonPointsFor: () => 700,
    })

    const first = foldCupTies(buildRows(), levelContext)
    const second = foldCupTies(buildRows(), levelContext)
    const winner = tieAt(first, "round_of_16-0").winner

    expect(winner === "a" || winner === "b").toBe(true)
    expect(tieAt(second, "round_of_16-0").winner).toBe(winner)
  })

  it("keeps a stored winner rather than deciding again", () => {
    const rows = buildRows({ "round_of_16-0": { winner: "b" } })
    const ties = foldCupTies(rows, context({ finishedGameweeks: [10] }))

    expect(tieAt(ties, "round_of_16-0").winner).toBe("b")
    expect(tieAt(ties, "quarter_final-0").personOne).toBe("b")
  })

  it("renders a finished past season from stored scores with no fantasy data", () => {
    const rows = buildRows({
      "round_of_16-0": { personOneLegOne: 71, personTwoLegOne: 44, winner: "a" },
    })
    const ties = foldCupTies(rows, context({ pointsFor: () => null }))

    expect(tieAt(ties, "round_of_16-0")).toMatchObject({
      status: "settled",
      aggregateOne: 71,
      aggregateTwo: 44,
      winner: "a",
    })
  })
})

describe("levelTieGameweeks", () => {
  it("lists the gameweeks of settled ties that finished level", () => {
    const ties = foldCupTies(buildRows(), context({ finishedGameweeks: [10], pointsFor: () => 60 }))

    expect(levelTieGameweeks(ties)).toEqual([10])
  })

  it("is empty when no settled tie was level", () => {
    const ties = foldCupTies(buildRows(), context({ finishedGameweeks: [10] }))

    expect(levelTieGameweeks(ties)).toEqual([])
  })
})

describe("cupBakeRows", () => {
  it("bakes participants and scores once a round has settled", () => {
    const rows = buildRows()
    const ties = foldCupTies(rows, context({ finishedGameweeks: [10] }))
    const baked = cupBakeRows(rows, ties)

    expect(baked.find((row) => row.id === "round_of_16-0")).toMatchObject({
      personOneLegOne: 100,
      personTwoLegOne: 99,
      winner: "a",
    })
  })

  it("bakes the next round's participants before that round is played", () => {
    const rows = buildRows()
    const ties = foldCupTies(rows, context({ finishedGameweeks: [10] }))
    const baked = cupBakeRows(rows, ties)

    expect(baked.find((row) => row.id === "quarter_final-0")).toMatchObject({
      personOne: "a",
      personTwo: "c",
      winner: null,
    })
  })

  it("never bakes a score while the gameweek is still live", () => {
    const rows = buildRows()
    const ties = foldCupTies(rows, context({ currentGameweek: 10 }))

    expect(cupBakeRows(rows, ties)).toEqual([])
  })

  it("leaves an already settled row alone", () => {
    const rows = buildRows({
      "round_of_16-0": { personOneLegOne: 100, personTwoLegOne: 99, winner: "a" },
    })
    const ties = foldCupTies(rows, context({ finishedGameweeks: [10] }))

    expect(cupBakeRows(rows, ties).some((row) => row.id === "round_of_16-0")).toBe(false)
  })
})

describe("cupStatusFor", () => {
  it("reports a cup as running while its final has no winner", () => {
    const ties = foldCupTies(buildRows(), context())

    expect(cupStatusFor(ties, true)).toBe("running")
  })

  it("reports a cup as finished once the final has a winner", () => {
    const ties = foldCupTies(buildRows(), context({ finishedGameweeks: KNOCKOUT_GAMEWEEKS }))

    expect(cupStatusFor(ties, true)).toBe("finished")
  })

  it("reports a past season with no final winner as unfinished", () => {
    const ties = foldCupTies(buildRows(), context({ pointsFor: () => null }))

    expect(cupStatusFor(ties, false)).toBe("unfinished")
  })
})

describe("currentCupRound", () => {
  it("names the earliest round that has not settled", () => {
    const ties = foldCupTies(buildRows(), context({ finishedGameweeks: [10] }))

    expect(currentCupRound(ties)).toBe("quarter_final")
  })

  it("is null once every round has settled", () => {
    const ties = foldCupTies(buildRows(), context({ finishedGameweeks: KNOCKOUT_GAMEWEEKS }))

    expect(currentCupRound(ties)).toBeNull()
  })
})

describe("cupFinalResult", () => {
  it("reports the winner and the beaten finalist with their scores", () => {
    const ties = foldCupTies(buildRows(), context({ finishedGameweeks: KNOCKOUT_GAMEWEEKS }))

    expect(cupFinalResult(ties)).toEqual({
      winner: "a",
      loser: "i",
      winnerPoints: 100,
      loserPoints: 92,
    })
  })

  it("is null while the final has not been played", () => {
    const ties = foldCupTies(buildRows(), context({ finishedGameweeks: [10] }))

    expect(cupFinalResult(ties)).toBeNull()
  })
})

describe("two legged cups", () => {
  it("settle every round when all the gameweeks have finished", () => {
    const ties = foldCupTies(
      buildRows(),
      context({
        format: "two_legs",
        schedule: TWO_LEG_SCHEDULE,
        finishedGameweeks: TWO_LEG_GAMEWEEKS,
      }),
    )

    expect(tieAt(ties, "final-0").winner).toBe("a")
    expect(tieAt(ties, "semi_final-0").legs).toHaveLength(2)
    expect(tieAt(ties, "final-0").legs).toHaveLength(1)
  })
})
