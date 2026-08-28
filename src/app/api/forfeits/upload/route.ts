import { FORFEIT_MEDIA_MIME_EXTENSIONS, MAX_FORFEIT_MEDIA_BYTES } from "@pbd/lib/constants/Forfeits"
import { isForfeitBlobPath } from "@pbd/lib/forfeitsPaths"
import { minutes } from "@pbd/lib/time"
import { hasGateAccess } from "@pbd/server/forfeits/gate"
import { issueSignedToken } from "@vercel/blob"
import { handleUploadPresigned } from "@vercel/blob/client"
import type { HandleUploadPresignedBody } from "@vercel/blob/client"

const ALLOWED_UPLOAD_CONTENT_TYPES = Object.keys(FORFEIT_MEDIA_MIME_EXTENSIONS)

const UPLOAD_TOKEN_TTL_MS = minutes(30)

export const POST = async (request: Request): Promise<Response> => {
  if (!hasGateAccess("upload", request.headers)) return new Response(null, { status: 401 })

  const body = (await request.json().catch(() => null)) as HandleUploadPresignedBody | null
  if (body === null) return new Response(null, { status: 400 })

  try {
    const result = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname) => {
        if (!isForfeitBlobPath(pathname))
          throw new Error("Uploads must live in the forfeits folder")

        return {
          token: await issueSignedToken({
            pathname,
            operations: ["put"],
            allowedContentTypes: ALLOWED_UPLOAD_CONTENT_TYPES,
            maximumSizeInBytes: MAX_FORFEIT_MEDIA_BYTES,
            validUntil: Date.now() + UPLOAD_TOKEN_TTL_MS,
          }),
          urlOptions: { addRandomSuffix: true },
        }
      },
    })

    return Response.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload rejected"
    return Response.json({ error: message }, { status: 400 })
  }
}
