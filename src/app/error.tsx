"use client"

import type { JSX } from "react"

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

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
