import "server-only"

import { hours, minutes } from "@pbd/lib/time"
import { issueSignedToken, presignUrl } from "@vercel/blob"
import type { IssuedSignedToken } from "@vercel/blob"

export const SIGNED_MEDIA_URL_TTL_MS = hours(24)

const TOKEN_REFRESH_BUFFER_MS = minutes(5)

let readToken: IssuedSignedToken | null = null

const getReadToken = async (): Promise<IssuedSignedToken> => {
  const now = Date.now()
  const isUsable =
    readToken !== null &&
    readToken.validUntil - now > SIGNED_MEDIA_URL_TTL_MS + TOKEN_REFRESH_BUFFER_MS

  if (readToken === null || !isUsable) {
    readToken = await issueSignedToken({
      operations: ["get"],
      validUntil: now + SIGNED_MEDIA_URL_TTL_MS * 2,
    })
  }

  return readToken
}

export const signForfeitMediaUrl = async (pathname: string): Promise<string> => {
  const token = await getReadToken()
  const { presignedUrl } = await presignUrl(token, {
    operation: "get",
    pathname,
    access: "private",
    validUntil: Date.now() + SIGNED_MEDIA_URL_TTL_MS,
  })

  return presignedUrl
}
