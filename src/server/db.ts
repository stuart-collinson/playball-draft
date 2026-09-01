import "server-only"

import { neon } from "@neondatabase/serverless"

type Sql = ReturnType<typeof neon>

let client: Sql | null = null

export const getSql = (): Sql => {
  if (client === null) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error("DATABASE_URL is not set")
    client = neon(url)
  }

  return client
}

export const isDatabaseConfigured = (): boolean => Boolean(process.env.DATABASE_URL)
