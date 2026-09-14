export type ForfeitsCursor = {
  createdAt: string
  id: string
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const isTimestamp = (value: string): boolean => !Number.isNaN(Date.parse(value))

export const encodeForfeitsCursor = (cursor: ForfeitsCursor): string =>
  Buffer.from(JSON.stringify(cursor)).toString("base64url")

export const decodeForfeitsCursor = (token: string): ForfeitsCursor | null => {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(token, "base64url").toString("utf8"))
    if (typeof parsed !== "object" || parsed === null) return null

    const { createdAt, id } = parsed as Record<string, unknown>
    if (typeof createdAt !== "string" || typeof id !== "string") return null
    if (!isTimestamp(createdAt) || !UUID_PATTERN.test(id)) return null

    return { createdAt, id }
  } catch {
    return null
  }
}
