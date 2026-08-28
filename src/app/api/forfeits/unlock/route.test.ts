import { POST } from "@pbd/app/api/forfeits/unlock/route"
import { GATE_COOKIE_NAMES } from "@pbd/server/forfeits/gate"
import { afterEach, describe, expect, it, vi } from "vitest"

const VIEW_PASSWORD = "view-passphrase-for-the-league"
const UPLOAD_PASSWORD = "upload-passphrase-for-two-people"

const configure = (): void => {
  vi.stubEnv("FORFEITS_VIEW_PASSWORD", VIEW_PASSWORD)
  vi.stubEnv("FORFEITS_UPLOAD_PASSWORD", UPLOAD_PASSWORD)
}

const unlockRequest = (body: string): Request =>
  new Request("http://localhost/api/forfeits/unlock", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  })

const attempt = (audience: string, password: string): Promise<Response> =>
  POST(unlockRequest(JSON.stringify({ audience, password })))

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("POST /api/forfeits/unlock", () => {
  it("responds not-found when the feature is unconfigured, even with a correct-looking body", async () => {
    const response = await attempt("view", VIEW_PASSWORD)

    expect(response.status).toBe(404)
    expect(response.headers.get("set-cookie")).toBeNull()
  })

  it("rejects a malformed body", async () => {
    configure()

    const response = await POST(unlockRequest("not json"))

    expect(response.status).toBe(400)
  })

  it("rejects an unknown audience", async () => {
    configure()

    const response = await attempt("admin", VIEW_PASSWORD)

    expect(response.status).toBe(400)
  })

  it("rejects a wrong password without setting a cookie", async () => {
    configure()

    const response = await attempt("view", "not-the-password")

    expect(response.status).toBe(401)
    expect(response.headers.get("set-cookie")).toBeNull()
  })

  it("rejects the view password at the upload gate", async () => {
    configure()

    const response = await attempt("upload", VIEW_PASSWORD)

    expect(response.status).toBe(401)
    expect(response.headers.get("set-cookie")).toBeNull()
  })

  it("sets the httpOnly view cookie for the correct view password", async () => {
    configure()

    const response = await attempt("view", VIEW_PASSWORD)

    expect(response.status).toBe(204)
    const cookie = response.headers.get("set-cookie")
    expect(cookie).toContain(`${GATE_COOKIE_NAMES.view}=`)
    expect(cookie).toContain("HttpOnly")
  })

  it("sets the upload cookie, not the view cookie, for the upload password", async () => {
    configure()

    const response = await attempt("upload", UPLOAD_PASSWORD)

    expect(response.status).toBe(204)
    const cookie = response.headers.get("set-cookie")
    expect(cookie).toContain(`${GATE_COOKIE_NAMES.upload}=`)
    expect(cookie).not.toContain(`${GATE_COOKIE_NAMES.view}=`)
  })
})
