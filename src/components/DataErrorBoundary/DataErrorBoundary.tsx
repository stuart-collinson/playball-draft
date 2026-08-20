"use client"

import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"

type Props = {
  title?: string
  message?: string
  children: ReactNode
}

type State = {
  hasError: boolean
}

const DEFAULT_TITLE = "Nothing To Show"

const DEFAULT_MESSAGE = "Fantasy Premier League didn't return the data for this yet."

export class DataErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[DataErrorBoundary]", error.message, info.componentStack)
  }

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    return (
      <EmptyState
        title={this.props.title ?? DEFAULT_TITLE}
        message={this.props.message ?? DEFAULT_MESSAGE}
      />
    )
  }
}
