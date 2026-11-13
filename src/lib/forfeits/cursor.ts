import { isGameweekValue } from "@pbd/lib/gameweeks"

export type ForfeitsCursor = {
  season: string
  gameweek: string
  createdAt: string
  id: string
}

export type ReadForfeitsCursor =
  | { kind: "position"; cursor: ForfeitsCursor }
  | { kind: "uploadOrder" }
  | { kind: "unreadable" }

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const EARLIEST_STORABLE_TIME = Date.parse("0001-01-01T00:00:00.000Z")

const LATEST_STORABLE_TIME = Date.parse("9999-12-31T23:59:59.999Z")

const NUL_CHARACTER = "\u0000"

const isIssuedTimestamp = (value: string): boolean => {
  const time = Date.parse(value)
  if (!(time >= EARLIEST_STORABLE_TIME && time <= LATEST_STORABLE_TIME)) return false

  return new Date(time).toISOString() === value
}

const UNREADABLE_CURSOR: ReadForfeitsCursor = { kind: "unreadable" }

const isStorableText = (value: unknown): value is string =>
  typeof value === "string" && !value.includes(NUL_CHARACTER)

const readTokenFields = (token: string): Record<string, unknown> | null => {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(token, "base64url").toString("utf8"))
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

export const encodeForfeitsCursor = (cursor: ForfeitsCursor): string =>
  Buffer.from(JSON.stringify(cursor)).toString("base64url")

export const readForfeitsCursor = (token: string): ReadForfeitsCursor => {
  const fields = readTokenFields(token)
  if (!fields) return UNREADABLE_CURSOR

  const { season, gameweek, createdAt, id } = fields
  if (typeof createdAt !== "string" || !isIssuedTimestamp(createdAt)) return UNREADABLE_CURSOR
  if (typeof id !== "string" || !UUID_PATTERN.test(id)) return UNREADABLE_CURSOR
  if (!("season" in fields) && !("gameweek" in fields)) return { kind: "uploadOrder" }
  if (!isStorableText(season)) return UNREADABLE_CURSOR
  if (typeof gameweek !== "string" || !isGameweekValue(gameweek)) return UNREADABLE_CURSOR

  return { kind: "position", cursor: { season, gameweek, createdAt, id } }
}
