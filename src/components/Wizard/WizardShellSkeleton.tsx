import { Card, CardContent, CardHeader } from "@pbd/components/ui/card"
import { Skeleton } from "@pbd/components/ui/skeleton"
import type { JSX } from "react"

export const WizardShellSkeleton = (): JSX.Element => (
  <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
    <div className="flex h-4 items-center justify-between">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-14" />
    </div>
    <Skeleton className="h-1.5 w-full rounded-full" />

    <Card className="gap-4 rounded-2xl py-5">
      <CardHeader className="px-5">
        <Skeleton className="h-7 w-2/5" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-5">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-11 w-full rounded-md" />
      </CardContent>
    </Card>

    <div className="flex justify-between">
      <Skeleton className="h-9 w-16 rounded-md" />
      <Skeleton className="h-9 w-16 rounded-md" />
    </div>
  </div>
)
