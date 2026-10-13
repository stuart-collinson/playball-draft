const HOME_SCREENS = [
  { key: "comic", label: "Comic Strip" },
  { key: "newspaper", label: "Newspaper" },
  { key: "teletext", label: "Teletext" },
  { key: "halloween", label: "Halloween" },
] as const

export type HomeScreenKey = (typeof HOME_SCREENS)[number]["key"]

const HIDDEN_HOME_SCREENS: readonly HomeScreenKey[] = ["teletext"]

export const HOME_SCREEN_TABS = HOME_SCREENS.filter(({ key }) => !HIDDEN_HOME_SCREENS.includes(key))

export const DEFAULT_HOME_SCREEN: HomeScreenKey = "halloween"

export const HOME_SHARE_COPIED_MS = 2000

export const HOME_FRAME_CLASSES = "-mx-4 -mb-6 flex h-[calc(100dvh-6rem)] flex-col gap-3 sm:mx-0"

export const HOME_SCREEN_BOX_CLASSES = "flex min-h-0 flex-1 justify-center overflow-hidden"

export const HOME_SCREEN_CLASSES = "h-full w-full overflow-hidden sm:rounded-2xl"

export const HOME_SCREEN_NATURAL_HEIGHT = 780

export const HOME_SCREEN_MAX_WIDTH = 800

export const HOME_PITCH_DESIGN_WIDTH = 300
