import { mergeEntryRecords } from "@pbd/lib/fpl/entryRecords"
import { describe, expect, it } from "vitest"

describe("mergeEntryRecords", () => {
  it("folds every league's entries into one record", () => {
    const merged = mergeEntryRecords([{ 19445: 61, 19446: 48 }, { 19453: 55 }])

    expect(merged).toEqual({ 19445: 61, 19446: 48, 19453: 55 })
  })

  it("returns an empty record when there is nothing to merge", () => {
    expect(mergeEntryRecords([])).toEqual({})
  })

  it("does not mutate the records it was given", () => {
    const first = { 19445: 61 }

    mergeEntryRecords([first, { 19453: 55 }])

    expect(first).toEqual({ 19445: 61 })
  })
})
