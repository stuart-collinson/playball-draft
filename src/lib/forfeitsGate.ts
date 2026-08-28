import { createHash, createHmac, timingSafeEqual } from "node:crypto"

export type GateAudience = "view" | "upload"

export const MIN_GATE_PASSWORD_LENGTH = 12

const digest = (value: string): Buffer => createHash("sha256").update(value).digest()

const constantTimeMatch = (expected: string, presented: string): boolean =>
  timingSafeEqual(digest(expected), digest(presented))

export const computeGateToken = (password: string, audience: GateAudience): string =>
  createHmac("sha256", password).update(`playball-forfeits:${audience}`).digest("hex")

export const isGateTokenValid = (
  password: string,
  audience: GateAudience,
  token: string,
): boolean => constantTimeMatch(computeGateToken(password, audience), token)

export const isPasswordMatch = (expected: string, typed: string): boolean =>
  constantTimeMatch(expected, typed)
