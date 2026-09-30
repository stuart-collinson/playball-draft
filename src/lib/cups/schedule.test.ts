import {
  canCreateCup,
  cupGameweekOptions,
  defaultCupSchedule,
  earliestCupGameweek,
  isCupScheduleOrdered,
  latestCupGameweek,
  lockedCupRounds,
  withCupRoundGameweek,
} from "@pbd/lib/cups/schedule"
import type { CupGameweekBlock, CupSchedule } from "@pbd/types/cups.types"
import { describe, expect, it } from "vitest"

const blockAt = (
  options: { gameweek: number; block: CupGameweekBlock | null }[],
  gameweek: number,
): CupGameweekBlock | null => options.find((option) => option.gameweek === gameweek)?.block ?? null

describe("canCreateCup", () => {
  it("allows a knockout while four gameweeks are still open", () => {
    expect(canCreateCup("knockout", 35)).toBe(true)
  })

  it("blocks a knockout once only three gameweeks are left", () => {
    expect(canCreateCup("knockout", 36)).toBe(false)
  })

  it("allows two legs while seven gameweeks are still open", () => {
    expect(canCreateCup("two_legs", 32)).toBe(true)
  })

  it("blocks two legs once only six gameweeks are left", () => {
    expect(canCreateCup("two_legs", 33)).toBe(false)
  })

  it("blocks everything once the season has no open gameweeks", () => {
    expect(canCreateCup("knockout", null)).toBe(false)
  })
})

describe("defaultCupSchedule", () => {
  it("runs a knockout in four straight gameweeks", () => {
    expect(defaultCupSchedule("knockout", 10)).toEqual({
      round_of_16: 10,
      quarter_final: 11,
      semi_final: 12,
      final: 13,
    })
  })

  it("gives every two-legged round a pair of gameweeks", () => {
    expect(defaultCupSchedule("two_legs", 10)).toEqual({
      round_of_16: 10,
      quarter_final: 12,
      semi_final: 14,
      final: 16,
    })
  })
})

describe("latestCupGameweek", () => {
  it("leaves room for the three knockout rounds that follow", () => {
    expect(latestCupGameweek("knockout", "round_of_16")).toBe(35)
  })

  it("leaves room for both legs of the rounds that follow", () => {
    expect(latestCupGameweek("two_legs", "round_of_16")).toBe(32)
    expect(latestCupGameweek("two_legs", "quarter_final")).toBe(34)
    expect(latestCupGameweek("two_legs", "semi_final")).toBe(36)
  })

  it("lets the final run on the last gameweek of the season", () => {
    expect(latestCupGameweek("two_legs", "final")).toBe(38)
  })
})

describe("earliestCupGameweek", () => {
  it("starts the round of sixteen at the first open gameweek", () => {
    expect(earliestCupGameweek("knockout", "round_of_16", {}, 12)).toBe(12)
  })

  it("puts a knockout round the week after the one before it", () => {
    expect(earliestCupGameweek("knockout", "quarter_final", { round_of_16: 12 }, 12)).toBe(13)
  })

  it("skips the second leg of the round before it", () => {
    expect(earliestCupGameweek("two_legs", "quarter_final", { round_of_16: 12 }, 12)).toBe(14)
  })
})

describe("cupGameweekOptions", () => {
  it("blocks gameweeks whose deadline has already passed", () => {
    const options = cupGameweekOptions("knockout", "round_of_16", {}, 12)

    expect(blockAt(options, 11)).toBe("deadline_passed")
    expect(blockAt(options, 12)).toBeNull()
  })

  it("blocks gameweeks that clash with the round before", () => {
    const options = cupGameweekOptions("two_legs", "quarter_final", { round_of_16: 12 }, 12)

    expect(blockAt(options, 13)).toBe("clashes")
    expect(blockAt(options, 14)).toBeNull()
  })

  it("blocks gameweeks that leave no room for the later rounds", () => {
    const options = cupGameweekOptions("knockout", "round_of_16", {}, 12)

    expect(blockAt(options, 36)).toBe("no_room")
    expect(blockAt(options, 35)).toBeNull()
  })

  it("offers one option for every gameweek in the season", () => {
    expect(cupGameweekOptions("knockout", "final", { semi_final: 20 }, 12)).toHaveLength(38)
  })
})

describe("isCupScheduleOrdered", () => {
  const schedule = (overrides: Partial<CupSchedule> = {}): CupSchedule => ({
    round_of_16: 10,
    quarter_final: 12,
    semi_final: 14,
    final: 16,
    ...overrides,
  })

  it("accepts rounds that run in order with gaps", () => {
    expect(isCupScheduleOrdered("knockout", schedule())).toBe(true)
  })

  it("accepts two-legged rounds that leave room for the second leg", () => {
    expect(isCupScheduleOrdered("two_legs", schedule())).toBe(true)
  })

  it("rejects a round landing on the second leg of the one before", () => {
    expect(isCupScheduleOrdered("two_legs", schedule({ quarter_final: 11 }))).toBe(false)
  })

  it("rejects rounds that run backwards", () => {
    expect(isCupScheduleOrdered("knockout", schedule({ semi_final: 11 }))).toBe(false)
  })

  it("rejects a final past the end of the season", () => {
    expect(isCupScheduleOrdered("knockout", schedule({ final: 39 }))).toBe(false)
  })
})

describe("lockedCupRounds", () => {
  const schedule: CupSchedule = {
    round_of_16: 10,
    quarter_final: 12,
    semi_final: 14,
    final: 16,
  }

  it("locks the rounds whose deadline has already passed", () => {
    expect(lockedCupRounds(schedule, 13)).toEqual(["round_of_16", "quarter_final"])
  })

  it("locks nothing while the whole cup is still ahead", () => {
    expect(lockedCupRounds(schedule, 9)).toEqual([])
  })

  it("locks everything once the season has no open gameweeks", () => {
    expect(lockedCupRounds(schedule, null)).toHaveLength(4)
  })
})

describe("withCupRoundGameweek", () => {
  const schedule: CupSchedule = {
    round_of_16: 10,
    quarter_final: 11,
    semi_final: 12,
    final: 13,
  }

  it("pushes the later rounds along when a round moves back", () => {
    expect(withCupRoundGameweek("knockout", schedule, "round_of_16", 20)).toEqual({
      round_of_16: 20,
      quarter_final: 21,
      semi_final: 22,
      final: 23,
    })
  })

  it("leaves a legal gap alone", () => {
    expect(withCupRoundGameweek("knockout", schedule, "quarter_final", 20)).toEqual({
      round_of_16: 10,
      quarter_final: 20,
      semi_final: 21,
      final: 22,
    })
  })

  it("makes room for second legs when pushing a two-legged cup", () => {
    expect(withCupRoundGameweek("two_legs", schedule, "round_of_16", 20)).toEqual({
      round_of_16: 20,
      quarter_final: 22,
      semi_final: 24,
      final: 26,
    })
  })
})
