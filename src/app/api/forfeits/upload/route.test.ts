import { POST } from "@pbd/app/api/forfeits/upload/route"
import { computeGateToken } from "@pbd/lib/forfeitsGate"
import { GATE_COOKIE_NAMES } from "@pbd/server/forfeits/gate"
import { afterEach, describe, expect, it, vi } from "vitest"

const VIEW_PASSWORD = "view-passphrase-for-the-league"
const UPLOAD_PASSWORD = "upload-passphrase-for-two-people"

const configure = (): void => {
  vi.stubEnv("FORFEITS_VIEW_PASSWORD", VIEW_PASSWORD)
  vi.stubEnv("FORFEITS_UPLOAD_PASSWORD", UPLOAD_PASSWORD)
}

const uploadRequest = (cookie?: string): Request =>
  new Request("http://localhost/api/forfeits/upload", {
    method: "POST",
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    body: "not json",
  })

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("POST /api/forfeits/upload", () => {
  it("rejects a request with no upload cookie before doing anything else", async () => {
    configure()

    const response = await POST(uploadRequest())

    expect(response.status).toBe(401)
  })

  it("rejects a view cookie planted as the upload cookie", async () => {
    configure()
    const viewToken = computeGateToken(VIEW_PASSWORD, "view")

    const response = await POST(uploadRequest(`${GATE_COOKIE_NAMES.upload}=${viewToken}`))

    expect(response.status).toBe(401)
  })

  it("rejects everything when the feature is unconfigured", async () => {
    const response = await POST(uploadRequest())

    expect(response.status).toBe(401)
  })

  it("rejects a malformed body from a correctly unlocked caller", async () => {
    configure()
    const uploadToken = computeGateToken(UPLOAD_PASSWORD, "upload")

    const response = await POST(uploadRequest(`${GATE_COOKIE_NAMES.upload}=${uploadToken}`))

    expect(response.status).toBe(400)
  })
})
