export type ForfeitsCursor = {
  season: string
  gameweek: string
  createdAt: string
  id: string
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/

const isTimestamp = (value: string): boolean =>
  ISO_TIMESTAMP_PATTERN.test(value) && !Number.isNaN(Date.parse(value))

export const encodeForfeitsCursor = (cursor: ForfeitsCursor): string =>
  Buffer.from(JSON.stringify(cursor)).toString("base64url")

export const decodeForfeitsCursor = (token: string): ForfeitsCursor | null => {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(token, "base64url").toString("utf8"))
    if (typeof parsed !== "object" || parsed === null) return null

    const { season, gameweek, createdAt, id } = parsed as Record<string, unknown>
    if (typeof season !== "string" || typeof gameweek !== "string") return null
    if (typeof createdAt !== "string" || typeof id !== "string") return null
    if (!isTimestamp(createdAt) || !UUID_PATTERN.test(id)) return null

    return { season, gameweek, createdAt, id }
  } catch {
    return null
  }
}
