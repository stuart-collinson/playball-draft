export type ForfeitsCursor = {
  createdAt: string
  id: string
}

export const encodeForfeitsCursor = (cursor: ForfeitsCursor): string =>
  Buffer.from(JSON.stringify(cursor)).toString("base64url")

export const decodeForfeitsCursor = (token: string): ForfeitsCursor | null => {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(token, "base64url").toString("utf8"))
    if (typeof parsed !== "object" || parsed === null) return null

    const { createdAt, id } = parsed as Record<string, unknown>
    if (typeof createdAt !== "string" || typeof id !== "string") return null
    if (createdAt.length === 0 || id.length === 0) return null

    return { createdAt, id }
  } catch {
    return null
  }
}
