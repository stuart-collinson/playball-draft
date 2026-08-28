export type ForfeitCategory = "weekly" | "annual"

export type ForfeitCadence = ForfeitCategory

export type ForfeitTypeSlug =
  | "pint"
  | "movie-tv-scene"
  | "tiktok-dance"
  | "wildcard"
  | "24-hours-pub"
  | "different-country"
  | "open-mic"
  | "tattoo"

export type WildcardSubTypeSlug =
  | "1km-run"
  | "song-cover"
  | "emoji-challenge"
  | "sea-swim"
  | "goal-celebration"

export type ForfeitType = {
  slug: ForfeitTypeSlug
  label: string
  category: ForfeitCategory
}

export type WildcardSubType = {
  slug: WildcardSubTypeSlug
  label: string
}

export const FORFEIT_TYPES: ForfeitType[] = [
  { slug: "pint", label: "Pint", category: "weekly" },
  { slug: "movie-tv-scene", label: "Movie/TV Scene", category: "weekly" },
  { slug: "tiktok-dance", label: "TikTok Dance", category: "weekly" },
  { slug: "wildcard", label: "Wildcard", category: "weekly" },
  { slug: "24-hours-pub", label: "24 Hours in a Pub", category: "annual" },
  { slug: "different-country", label: "Different Country", category: "annual" },
  { slug: "open-mic", label: "Open Mic", category: "annual" },
  { slug: "tattoo", label: "Tattoo", category: "annual" },
]

export const WILDCARD_SUB_TYPES: WildcardSubType[] = [
  { slug: "1km-run", label: "1km Run" },
  { slug: "song-cover", label: "Song Cover" },
  { slug: "emoji-challenge", label: "Emoji Challenge" },
  { slug: "sea-swim", label: "Sea Swim" },
  { slug: "goal-celebration", label: "Goal and Celebration" },
]

export const ANNUAL_GAMEWEEK = "annual"

export const CURRENT_SEASON = "2026/27"

export const FORFEIT_MEDIA_KINDS = ["photo", "video"] as const

export type ForfeitMediaKind = (typeof FORFEIT_MEDIA_KINDS)[number]

export const MAX_FORFEIT_MEDIA_BYTES = 25 * 1024 * 1024

export const FORFEIT_MEDIA_MIME_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export const FORFEIT_TITLE_MAX_LENGTH = 60

export const FORFEIT_DESCRIPTION_MAX_LENGTH = 2000
