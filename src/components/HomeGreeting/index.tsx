"use client"

import type { JSX } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useTRPC } from "@pbd/trpc/react"

export const HomeGreeting = (): JSX.Element => {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.example.hello.queryOptions({ text: "world" }))

  return <p className="text-lg text-brand-500">{data.greeting}</p>
}
