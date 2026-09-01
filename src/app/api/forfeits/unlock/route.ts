import {
  buildGateSetCookie,
  isGateConfigured,
  resolveUnlockAudience,
} from "@pbd/server/forfeits/gate"
import { z } from "zod"

const unlockSchema = z.object({
  audience: z.enum(["view", "upload"]),
  password: z.string().min(1),
})

const status = (code: number): Response => new Response(null, { status: code })

export const POST = async (request: Request): Promise<Response> => {
  const body = await request.json().catch(() => null)
  const parsed = unlockSchema.safeParse(body)
  if (!parsed.success) return status(400)

  const { audience, password } = parsed.data
  if (!isGateConfigured(audience)) return status(404)
  const granted = resolveUnlockAudience(audience, password)
  if (granted === null) return status(401)

  const cookie = buildGateSetCookie(granted)
  if (cookie === null) return status(404)

  return new Response(null, { status: 204, headers: { "set-cookie": cookie } })
}
