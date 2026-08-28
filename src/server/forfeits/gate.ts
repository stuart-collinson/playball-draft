import "server-only"

import {
  MIN_GATE_PASSWORD_LENGTH,
  computeGateToken,
  isGateTokenValid,
  isPasswordMatch,
} from "@pbd/lib/forfeitsGate"
import type { GateAudience } from "@pbd/lib/forfeitsGate"
import { TRPCError } from "@trpc/server"

export const GATE_COOKIE_NAMES: Record<GateAudience, string> = {
  view: "pbd_forfeits_view",
  upload: "pbd_forfeits_upload",
}

const GATE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180

const ENV_KEYS: Record<GateAudience, string> = {
  view: "FORFEITS_VIEW_PASSWORD",
  upload: "FORFEITS_UPLOAD_PASSWORD",
}

const configuredPassword = (audience: GateAudience): string | null => {
  const value = process.env[ENV_KEYS[audience]]
  return value && value.length >= MIN_GATE_PASSWORD_LENGTH ? value : null
}

export const isForfeitsConfigured = (): boolean =>
  configuredPassword("view") !== null && configuredPassword("upload") !== null

export const verifyGatePassword = (audience: GateAudience, typed: string): boolean => {
  const password = configuredPassword(audience)
  return password !== null && isPasswordMatch(password, typed)
}

const readCookie = (headers: Headers, name: string): string | null => {
  const header = headers.get("cookie")
  if (!header) return null

  for (const part of header.split(";")) {
    const [rawName, ...rest] = part.trim().split("=")
    if (rawName === name) return rest.join("=")
  }

  return null
}

export const hasGateAccess = (audience: GateAudience, headers: Headers): boolean => {
  const password = configuredPassword(audience)
  if (password === null) return false

  const token = readCookie(headers, GATE_COOKIE_NAMES[audience])
  return token !== null && isGateTokenValid(password, audience, token)
}

export const requireGateAccess = (audience: GateAudience, headers: Headers): void => {
  if (!isForfeitsConfigured()) throw new TRPCError({ code: "NOT_FOUND" })
  if (!hasGateAccess(audience, headers)) throw new TRPCError({ code: "UNAUTHORIZED" })
}

export const buildGateSetCookie = (audience: GateAudience): string | null => {
  const password = configuredPassword(audience)
  if (password === null) return null

  const attributes = [
    `${GATE_COOKIE_NAMES[audience]}=${computeGateToken(password, audience)}`,
    "Path=/",
    `Max-Age=${GATE_COOKIE_MAX_AGE_SECONDS}`,
    "HttpOnly",
    "SameSite=Lax",
  ]
  if (process.env.NODE_ENV === "production") attributes.push("Secure")

  return attributes.join("; ")
}
