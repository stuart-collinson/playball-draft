export type ForfeitsCursor = {
  season: string
  gameweek: string
  createdAt: string
  id: string
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const EARLIEST_STORABLE_TIME = Date.parse("0001-01-01T00:00:00.000Z")

const LATEST_STORABLE_TIME = Date.parse("9999-12-31T23:59:59.999Z")

const NUL_CHARACTER = "\u0000"

const isIssuedTimestamp = (value: string): boolean => {
  const time = Date.parse(value)
  if (!(time >= EARLIEST_STORABLE_TIME && time <= LATEST_STORABLE_TIME)) return false

  return new Date(time).toISOString() === value
}

const isStorableText = (value: unknown): value is string =>
  typeof value === "string" && !value.includes(NUL_CHARACTER)

export const encodeForfeitsCursor = (cursor: ForfeitsCursor): string =>
  Buffer.from(JSON.stringify(cursor)).toString("base64url")

export const decodeForfeitsCursor = (token: string): ForfeitsCursor | null => {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(token, "base64url").toString("utf8"))
    if (typeof parsed !== "object" || parsed === null) return null

    const { season, gameweek, createdAt, id } = parsed as Record<string, unknown>
    if (!isStorableText(season) || !isStorableText(gameweek)) return null
    if (typeof createdAt !== "string" || typeof id !== "string") return null
    if (!isIssuedTimestamp(createdAt) || !UUID_PATTERN.test(id)) return null

    return { season, gameweek, createdAt, id }
  } catch {
    return null
  }
}
