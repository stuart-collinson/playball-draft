export const HOME_SCREENS = [
  { key: "comic", label: "Comic Strip" },
  { key: "cinema", label: "Cinema" },
  { key: "teletext", label: "Teletext" },
] as const

export type HomeScreenKey = (typeof HOME_SCREENS)[number]["key"]

export const DEFAULT_HOME_SCREEN: HomeScreenKey = "cinema"

export const HOME_SHARE_COPIED_MS = 2000
