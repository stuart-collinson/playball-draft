import { DEFAULT_HOME_SCREEN, HOME_SCREEN_TABS } from "@pbd/lib/constants/Home"
import { describe, expect, it } from "vitest"

describe("home screen tabs", () => {
  it("opens on a screen that has a visible tab", () => {
    const visibleKeys = HOME_SCREEN_TABS.map(({ key }) => key)

    expect(visibleKeys).toContain(DEFAULT_HOME_SCREEN)
  })
})
