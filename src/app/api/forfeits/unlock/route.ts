import {
  buildGateSetCookie,
  isForfeitsConfigured,
  verifyGatePassword,
} from "@pbd/server/forfeits/gate"
import { z } from "zod"

const unlockSchema = z.object({
  audience: z.enum(["view", "upload"]),
  password: z.string().min(1),
})

const status = (code: number): Response => new Response(null, { status: code })

export const POST = async (request: Request): Promise<Response> => {
  if (!isForfeitsConfigured()) return status(404)

  const body = await request.json().catch(() => null)
  const parsed = unlockSchema.safeParse(body)
  if (!parsed.success) return status(400)

  const { audience, password } = parsed.data
  if (!verifyGatePassword(audience, password)) return status(401)

  const cookie = buildGateSetCookie(audience)
  if (cookie === null) return status(404)

  return new Response(null, { status: 204, headers: { "set-cookie": cookie } })
}
