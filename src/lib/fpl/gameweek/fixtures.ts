import type { EventLiveFixture } from "@pbd/types/fpl.types"

export const hasFixtureConcluded = (fixture: EventLiveFixture): boolean =>
  fixture.finished || fixture.finished_provisional
