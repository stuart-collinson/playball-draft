export const HOME_SCREENS = [
  { key: "comic", label: "Comic Strip" },
  { key: "cinema", label: "Cinema" },
  { key: "teletext", label: "Teletext" },
] as const

export type HomeScreenKey = (typeof HOME_SCREENS)[number]["key"]

export const DEFAULT_HOME_SCREEN: HomeScreenKey = "cinema"

export const HOME_SHARE_COPIED_MS = 2000

export const HOME_FRAME_CLASSES = "-mx-4 -mb-6 flex h-[calc(100dvh-6rem)] flex-col gap-3 sm:mx-0"

export const HOME_SCREEN_CLASSES = "min-h-0 flex-1 overflow-x-hidden overflow-y-auto sm:rounded-2xl"
