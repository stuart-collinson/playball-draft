"use client"

import type { JSX } from "react"

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

// Root error boundary. A suspense query that exhausts its retries — an FPL
// 502, or an endpoint that 404s outside the season — lands here instead of
// white-screening the app.
const ErrorPage = ({ reset }: ErrorPageProps): JSX.Element => (
  <div className="flex flex-col items-center gap-4 py-16 text-center">
    <p className="text-sm text-muted-foreground">
      Couldn&apos;t load the latest data from Fantasy Premier League.
    </p>
    <button
      type="button"
      onClick={reset}
      className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-accent"
    >
      Try again
    </button>
  </div>
)

export default ErrorPage
