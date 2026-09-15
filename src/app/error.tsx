"use client"

import { Button } from "@pbd/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@pbd/components/ui/empty"
import type { JSX } from "react"

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

const ErrorPage = ({ reset }: ErrorPageProps): JSX.Element => (
  <Empty className="py-16">
    <EmptyHeader>
      <EmptyTitle>Something went wrong</EmptyTitle>
      <EmptyDescription>
        Couldn&apos;t load the latest data from Fantasy Premier League.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </EmptyContent>
  </Empty>
)

export default ErrorPage
